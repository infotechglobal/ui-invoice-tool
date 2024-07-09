'use client'
import { useEffect, useCallback } from "react";
import Sidebar from "../../../../components/Sidebar";
import axios from 'axios';
import { useFileStore } from '../../../../store/uploadedFilesStore';

export default function ScreensLayout({ children }) {
  const addFile = useFileStore((state) => state.addNewFiles);

  const fetchData = useCallback(async () => {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/getallfiles`);
    console.log(data.allFiles);
    addFile(data.allFiles);
  }, [addFile]);

  useEffect(() => {
    console.log("fetching data in Layout");
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex bg-sidebarBG">
      <div className="w-[280px] h-[100vh] flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-grow border-2 border-inherit">
        {children}
      </div>
    </div>
  );
}
