import type { ReactNode } from 'react';
import React, { forwardRef, type ButtonHTMLAttributes } from 'react';
import cn from 'classnames';

import { SvgIcon } from '../SvgIcon';
import { Paragraph } from '../Typography';

import classes from './Button.module.css';

export type ButtonProps = {
  /** Specify which variant to use */
  variant?: 'filled' | 'outline' | 'quiet';
  /** Specify which color palette to use */
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'inverted';
  /** Size */
  size?: 'small' | 'medium' | 'large';
  /** If `Button` should fill full width of its container */
  fullWidth?: boolean;
  /** Enabled dashed border for `outline` variant */
  dashedBorder?: boolean;
  /** Icon to be rendered in the button. This should be a React component that renders an SVG object. */
  icon?: ReactNode;
  /** Icon position inside Button */
  iconPlacement?: 'right' | 'left';
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Button used for interaction
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      color = 'primary',
      variant = 'filled',
      size = 'medium',
      fullWidth = false,
      dashedBorder = false,
      iconPlacement = 'left',
      icon,
      type = 'button',
      className,
      ...restHTMLProps
    },
    ref,
  ) => (
    <button
      {...restHTMLProps}
      ref={ref}
      className={cn(
        classes.button,
        classes[size],
        classes[variant],
        classes[color],
        { [classes.fullWidth]: fullWidth },
        { [classes.dashedBorder]: dashedBorder },
        { [classes.onlyIcon]: !children && icon },
        className,
      )}
      type={type}
    >
      {icon && iconPlacement === 'left' && (
        <SvgIcon
          svgIconComponent={icon}
          className={classes.icon}
        />
      )}
      {children && (
        <Paragraph
          as='span'
          size={size}
          className={classes.typography}
        >
          {children}
        </Paragraph>
      )}
      {icon && iconPlacement === 'right' && (
        <SvgIcon
          svgIconComponent={icon}
          className={classes.icon}
        />
      )}
    </button>
  ),
);

Button.displayName = 'Button';
