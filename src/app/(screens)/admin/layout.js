import Sidebar from "../../../../components/Sidebar";
export default function ScreensLayout({ children }) {
  return (
        <div className="flex  bg-sidebarBG">
          <div className="w-[280px] h-[100vh] flex-shrink-0   ">
            <Sidebar />
          </div>
          <div className="flex-grow border-2 border-gray-500" >
            {children}
          </div>
        </div>

  );
}
