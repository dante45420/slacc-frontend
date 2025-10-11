export default function Button({ variant = "primary", children, ...props }) {
  const className = `btn ${variant === "outline" ? "btn-outline" : "btn-primary"}`;
  return (
    <button className={className} {...props}>{children}</button>
  );
}


