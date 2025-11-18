import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CourseBuilder from "./CourseBuilder";
import api from "../../api/client";
import { db } from "../../db"; // ✅ Import Dexie DB
import Loader from "../../components/Loader";


const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  
  const [course, setCourse] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize only once on mount
  useEffect(() => {
    if (isInitialized) return;
    setIsInitialized(true);
  }, [isInitialized]);

  // Fetch course details
  useEffect(() => {
    if (!courseId) return;
            // db.modules.where("courseId").equals(courseId).delete();

    api
      .get(`/course/${courseId}`)
      .then((res) => {
        setCourse(res.data)
        localStorage.setItem("coursename", res.data.name);

      })
      .catch(() => {});
      
  }, [courseId]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Full screen CourseBuilder - no header, no back button */}
      {courseId && <CourseBuilder courseId={courseId} />}
    </div>
  );
};

export default CourseDetail;