export function AuroraMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Violet blob */}
      <div
        className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full opacity-30 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
          filter: "blur(120px)",
          animation: "blob-morph-1 25s ease-in-out infinite",
        }}
      />
      {/* Blue blob */}
      <div
        className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full opacity-25 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
          filter: "blur(150px)",
          animation: "blob-morph-2 20s ease-in-out infinite",
        }}
      />
      {/* Rose blob */}
      <div
        className="absolute bottom-1/4 left-1/3 h-[450px] w-[450px] rounded-full opacity-20 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, transparent 70%)",
          filter: "blur(180px)",
          animation: "blob-morph-3 30s ease-in-out infinite",
        }}
      />
    </div>
  );
}
