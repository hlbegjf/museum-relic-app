import type { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import About from '@/pages/About';
import Collection from '@/pages/Collection';
import Home from '@/pages/Home';
import MuseumSelect from '@/pages/MuseumSelect';
import Quiz from '@/pages/Quiz';
import Result from '@/pages/Result';
import { useFateStore } from '@/store/fate';

/** 未生成气质画像时，将选馆 / 结果页重定向回答题 */
function RequireProfile({ children }: { children: ReactNode }) {
  const hasProfile = useFateStore((s) => s.profile !== null);
  if (!hasProfile) return <Navigate to="/quiz" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route
          path="/museum"
          element={
            <RequireProfile>
              <MuseumSelect />
            </RequireProfile>
          }
        />
        <Route
          path="/result/:museumKey"
          element={
            <RequireProfile>
              <Result />
            </RequireProfile>
          }
        />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
