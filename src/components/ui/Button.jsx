// variant: 'primary' | 'secondary' | 'ghost'
export default function Button({ variant = 'primary', block = false, className = '', ...props }) {
  const classes = ['btn', `btn--${variant}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ');
  return <button type="button" className={classes} {...props} />;
}
