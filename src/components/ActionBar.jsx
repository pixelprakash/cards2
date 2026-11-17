// Sticky bar at the bottom of each screen: Back on the left, the way forward on the right.
export default function ActionBar({ back, children, need }) {
  return (
    <div className="actionbar">
      <div className="wrap">
        <div>{back}</div>
        <div className="right">
          {need && <p className="need" role="status">{need}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
