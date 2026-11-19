import Dialog from "./Dialog.jsx";

// Wording that is still the research team's to confirm is marked, so nothing here reads as final ethics text.
const PENDING = <p className="dlg-note">Wording to be confirmed by the research team before the study opens.</p>;

export const INFO = {
  help: {
    title: "How this works",
    body: (
      <>
        <p>You are imagining an institution for learning. There are no right answers, and nothing here is a score.</p>
        <p>Pick a route at the start. On <b>Imagine Freely</b> you describe your idea in your own words. On <b>Configure Your Institution</b> you work through dimensions, six of them required.</p>
        <p>Anything marked optional can be skipped. You can go back and change an answer at any time; going back never erases it. Your progress is kept in this browser, so you can close the page and return.</p>
      </>
    ),
  },
  study: {
    title: "Study information",
    body: (
      <>
        <p>This is a research experience about how students and faculty imagine possible institutions for learning. It is not a university builder, a prediction, a ranking or a feasibility test.</p>
        <p>You get a random code instead of a name, and your answers are stored under that code. If you ever want them removed, give the research team your code and they will delete them. The code cannot reopen your answers, so it is only for finding and removing them.</p>
        {PENDING}
      </>
    ),
  },
  data: {
    title: "AI and data",
    body: (
      <>
        <p>Near the end, your answers are organised into a written profile of your institution. The draft only uses what you wrote and chose. It does not add ideas, advice or missing features, and where you described a tension it describes it rather than resolving it.</p>
        <p>You can edit every part of the profile, regenerate it from your existing answers, and approve the final version. The draft, your edits and the approved version are stored as separate versions.</p>
        {PENDING}
      </>
    ),
  },
  access: {
    title: "Accessibility",
    body: (
      <>
        <p>Everything can be used with a keyboard, with a screen reader and on a phone. Points can be set by typing a number or with the plus and minus buttons, so dragging is never needed. Steps are reordered with buttons.</p>
        <p>Meaning is never carried by colour alone. If something does not work for you, please tell the research team.</p>
        {PENDING}
      </>
    ),
  },
};

export default function InfoDialog({ which, onClose }) {
  const d = which ? INFO[which] : null;
  return <Dialog open={Boolean(d)} onClose={onClose} title={d?.title ?? ""}>{d?.body}</Dialog>;
}
