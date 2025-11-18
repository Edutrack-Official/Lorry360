import Dexie, { Table } from "dexie";

// Interfaces
export interface Module {
  _id: string;
  courseId: string;
  moduleName: string;
  moduleDescription: string;
  order: number;
  createdBy: string;
  lastUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
  isNew: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
}

export interface Section {
  _id: string;
  moduleId: string;
  sectionName: string;
  sectionDescription: string;
  order: number;
  createdBy: string;
  lastUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
  isNew: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
}

export interface Test {
  _id: string;
  sectionId: string;
  courseId: string;
  testId: string;
  type: string;
  order: number;
  createdBy: string;
  lastUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
  isNew: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
}

// Dexie DB
export class CourseDB extends Dexie {
  modules!: Table<Module, string>;
  sections!: Table<Section, string>;
  tests!: Table<Test, string>;

  constructor() {
    super("CourseDB");
    this.version(1).stores({
      modules: "_id, courseId, moduleName",
      sections: "_id, moduleId, sectionName",
      tests: "_id, sectionId, courseId, testId"
    });
  }
}

export const db = new CourseDB();
