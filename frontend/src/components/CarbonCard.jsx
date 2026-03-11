function CarbonCard({ title, value }) {
  return (
    <div style={{
      padding: "20px",
      background: "#F5F7F6",
      borderRadius: "12px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
      minWidth: "150px"
    }}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}

export default CarbonCard;
