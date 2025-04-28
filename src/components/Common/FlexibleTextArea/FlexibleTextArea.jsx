import React from 'react';

const FlexibleTextArea = React.forwardRef(({ value, onChange, className = '', style = {}, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        outline: 'none',
        padding: 8,
        boxSizing: 'border-box',
        resize: 'none',
        ...style,
      }}
      onInput={e => onChange && onChange({ target: { value: e.currentTarget.textContent } })}
      {...props}
    >
      {value}
    </div>
  );
});

export default FlexibleTextArea; 