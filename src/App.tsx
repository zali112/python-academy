import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MobileSidebar, Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { Toaster } from "@/components/ui/Toaster";
import { HomePage } from "@/pages/HomePage";
import { CoursesPage } from "@/pages/CoursesPage";
import { CoursePage } from "@/pages/CoursePage";
import { LessonPage } from "@/pages/LessonPage";
import { PlaygroundPage } from "@/pages/PlaygroundPage";
import { PracticePage } from "@/pages/PracticePage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { TrainersPage } from "@/pages/TrainersPage";
import { PythonReferencePage } from "@/pages/PythonReferencePage";
import { NetworksReferencePage } from "@/pages/NetworksReferencePage";
import { ProgressPage } from "@/pages/ProgressPage";
import { AchievementsPage } from "@/pages/AchievementsPage";
import { SearchPage } from "@/pages/SearchPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AboutPage } from "@/pages/AboutPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** Прокидывает URL в document.title/meta и запускает прокрутку наверх. */
function PageEffects() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);
  return null;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <PageEffects />
      <Header onOpenMenu={() => setMenuOpen(true)} />
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="main" className="flex-1 pb-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CoursePage />} />
              <Route path="/learn/:courseId/:lessonId" element={<LessonPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/practice/:taskId" element={<PracticePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/trainers" element={<TrainersPage />} />
              <Route path="/reference/python" element={<PythonReferencePage />} />
              <Route path="/reference/networks" element={<NetworksReferencePage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
