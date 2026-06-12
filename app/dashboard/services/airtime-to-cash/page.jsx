import React from "react";

function YourPageComponent() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh", // Occupy most of the viewport height
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        color: "#333",
        backgroundColor: "#f8f8f8",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3em", marginBottom: "20px", color: "#555" }}>
        Coming Soon!
      </h1>
      <p style={{ fontSize: "1.2em", maxWidth: "600px", lineHeight: "1.5" }}>
        We're currently working hard to bring you an amazing experience. Please
        check back later for updates.
      </p>
      {/* You can add a countdown, subscription form, or social media links here */}
      {/* <p style={{ marginTop: '30px', fontSize: '1em', color: '#777' }}>
        Follow us on social media for announcements!
      </p> */}
    </div>
  );
}

export default YourPageComponent;
