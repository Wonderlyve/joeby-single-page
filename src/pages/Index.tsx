const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/20 to-background"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 text-center">
        <h1 className="text-8xl md:text-9xl font-bold text-primary animate-glow animate-float tracking-wider">
          joeby
        </h1>
        
        {/* Subtle accent line */}
        <div className="mt-8 mx-auto w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
      </div>
      
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
    </div>
  );
};

export default Index;
