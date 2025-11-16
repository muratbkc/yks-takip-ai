import type { LessonType, StudyField } from "@/types";

export type LessonGroup = {
  label: string;
  lessons: LessonType[];
};

const TYT_GROUPS: LessonGroup[] = [
  {
    label: "TYT - Türkçe & Sosyal",
    lessons: ["Türkçe", "Tarih", "Coğrafya", "Felsefe", "Din Kültürü"],
  },
  {
    label: "TYT - Matematik & Fen",
    lessons: ["Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji"],
  },
];

export const TYT_LESSONS: LessonType[] = TYT_GROUPS.flatMap(g => g.lessons);

const FIELD_GROUPS: Record<StudyField, LessonGroup[]> = {
  sayisal: [
    {
      label: "AYT - Sayısal Testi",
      lessons: ["AYT Matematik", "AYT Fizik", "AYT Kimya", "AYT Biyoloji"],
    },
  ],
  "esit-agirlik": [
    {
      label: "AYT - Eşit Ağırlık",
      lessons: ["AYT Matematik", "AYT Edebiyat", "AYT Tarih-1", "AYT Coğrafya-1"],
    },
  ],
  sozel: [
    {
      label: "AYT - Sözel Temeller",
      lessons: ["AYT Edebiyat", "AYT Tarih-1", "AYT Coğrafya-1"],
    },
    {
      label: "AYT - Sosyal Bilimler-2",
      lessons: [
        "AYT Tarih-2",
        "AYT Coğrafya-2",
        "AYT Felsefe",
        "AYT Din Kültürü",
        "AYT Psikoloji",
        "AYT Sosyoloji",
        "AYT Mantık",
      ],
    },
  ],
};

export const AYT_SAY_LESSONS: LessonType[] = FIELD_GROUPS.sayisal.flatMap(g => g.lessons);
export const AYT_EA_LESSONS: LessonType[] = FIELD_GROUPS["esit-agirlik"].flatMap(g => g.lessons);
export const AYT_SOZ_LESSONS: LessonType[] = FIELD_GROUPS.sozel.flatMap(g => g.lessons);


export const studyFieldLabels: Record<StudyField, string> = {
  sayisal: "Sayısal",
  "esit-agirlik": "Eşit Ağırlık",
  sozel: "Sözel",
};

export function getLessonGroupsForField(
  field?: StudyField | null,
): LessonGroup[] {
  if (!field) {
    return [
      ...TYT_GROUPS,
      ...FIELD_GROUPS.sayisal,
      ...FIELD_GROUPS["esit-agirlik"],
      ...FIELD_GROUPS.sozel,
    ];
  }

  return [...TYT_GROUPS, ...FIELD_GROUPS[field]];
}

export function getDefaultLessonForField(
  field?: StudyField | null,
): LessonType {
  const groups = getLessonGroupsForField(field);
  return groups[0]?.lessons[0] ?? "Matematik";
}

export function getLessonOptionsForField(
  field?: StudyField | null,
): LessonType[] {
  return Array.from(
    new Set(
      getLessonGroupsForField(field).flatMap((group) => group.lessons),
    ),
  );
}

