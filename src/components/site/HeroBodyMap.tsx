export function HeroBodyMap() {
  return (
    <div
      className="original-body-map"
      aria-label="Corrective movement body map showing shoulder, hip, and knee focus areas"
      role="img"
    >
      <span className="original-map-axis" aria-hidden="true" />
      <span className="original-map-label original-map-shoulder">01 / shoulder</span>
      <span className="original-map-label original-map-hip">02 / hip</span>
      <span className="original-map-label original-map-knee">03 / knee</span>
      <span className="original-map-side-label">mobility / stability / strength</span>
      <div className="original-body-figure" aria-hidden="true">
        <span className="original-head" />
        <span className="original-torso" />
        <span className="original-arm original-left" />
        <span className="original-arm original-right" />
        <span className="original-leg original-left" />
        <span className="original-leg original-right" />
        <span className="original-joint original-shoulder" />
        <span className="original-joint original-hip" />
        <span className="original-joint original-knee" />
      </div>
    </div>
  );
}
