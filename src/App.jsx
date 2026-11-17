import { Route, Routes } from "react-router-dom";
import Shell from "./components/Shell.jsx";
import Entry from "./screens/Entry.jsx";
import ImagineFreely from "./screens/ImagineFreely.jsx";
import ExperienceScreen from "./screens/ExperienceScreen.jsx";
import DimensionsHub from "./screens/DimensionsHub.jsx";
import DimensionScreen from "./screens/DimensionScreen.jsx";
import ActivitiesHub from "./screens/ActivitiesHub.jsx";
import ActivityScreen from "./screens/ActivityScreen.jsx";
import Institution from "./screens/Institution.jsx";
import Profile from "./screens/Profile.jsx";
import Reflection from "./screens/Reflection.jsx";
import Done from "./screens/Done.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Entry />} />
        <Route path="imagine" element={<ImagineFreely />} />
        <Route path="experience" element={<ExperienceScreen />} />
        <Route path="dimensions" element={<DimensionsHub />} />
        <Route path="dimension/:id" element={<DimensionScreen />} />
        <Route path="activities" element={<ActivitiesHub />} />
        <Route path="activity/:id" element={<ActivityScreen />} />
        <Route path="institution" element={<Institution />} />
        <Route path="profile" element={<Profile />} />
        <Route path="reflection" element={<Reflection />} />
        <Route path="done" element={<Done />} />
        <Route path="*" element={<Entry />} />
      </Route>
    </Routes>
  );
}
