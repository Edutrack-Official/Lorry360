export type TestLite = {
  _id: string;
  name?: string;
  title?: string;
  type: string;
};

export type SectionTest = {
  _id: string; // ✅ Optional because new tests won’t have an ID yet
  sectionId?: string;
  testId?: string;
  order: number;
  type: string;
  testName?: string;

  /** ✅ Flags for backend compatibility */
  isNew?: boolean;
  isUpdated?: boolean;
  isDeleted?: boolean;
  isLocal?:boolean
};

export type Section = {
  _id: string; // ✅ Optional for new sections
  moduleId?: string;
  sectionName: string;
  sectionDescription?: string;
  order: number;
  tests?: SectionTest[];

  /** ✅ Flags for backend compatibility */
  isNew?: boolean;
  isUpdated?: boolean;
  isDeleted?: boolean;
    isLocal?:boolean

};

export type ModuleItem = {
  _id: string; // ✅ Optional for new modules
  courseId: string;
  moduleName: string;
  moduleDescription?: string;
  order: number;
  sections?: Section[];

  /** ✅ Flags for backend compatibility */
  isNew?: boolean;
  isUpdated?: boolean;
  isDeleted?: boolean;
    isLocal?:boolean

    batchId?: string;

};
