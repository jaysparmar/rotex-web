export function ValueIcon({ icon }: { icon: string }) {
  if (!icon) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={icon} alt="" className="size-5" />;
}
