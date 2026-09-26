export default function WidgetWrapper({ title, children, actions, className = '', style = {} }) {
  return (
    <div className={`widget ${className}`} style={style}>
      {title && (
        <div className="widget-header">
          <span className="widget-title">{title}</span>
          {actions && <div className="widget-actions">{actions}</div>}
        </div>
      )}
      <div className="widget-body">{children}</div>
    </div>
  );
}
