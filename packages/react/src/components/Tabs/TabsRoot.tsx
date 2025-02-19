import type { HTMLAttributes } from 'react';
import { createContext, forwardRef, useState } from 'react';
import cl from 'clsx/lite';

export type TabsProps = {
  /** Controlled state for `Tabs` component. */
  value?: string;
  /** Default value. */
  defaultValue?: string;
  /** Callback with selected `TabItem` `value` */
  onChange?: (value: string) => void;
  /**
   * Changes items size and paddings
   * @default md
   */
  size?: 'sm' | 'md' | 'lg';
} & Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'value'>;

export type TabsContextProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: TabsProps['size'];
};

export const TabsContext = createContext<TabsContextProps>({});

/**
 * Display a group of tabs that can be toggled between.
 * @example
 * ```tsx
 * <Tabs.Root onChange={(value) => console.log(value)}>
 *   <Tabs.List>
 *     <Tabs.Tab value='1'>Tab 1</Tabs.Tab>
 *     <Tabs.Tab value='2'>Tab 2</Tabs.Tab>
 *     <Tabs.Tab value='3'>Tab 3</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Content value='1'>content 1</Tabs.Content>
 *   <Tabs.Content value='2'>content 2</Tabs.Content>
 *   <Tabs.Content value='3'>content 3</Tabs.Content>
 * </Tabs.Root>
 * ```
 */
export const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      size = 'md',
      children,
      value,
      defaultValue,
      className,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<
      string | undefined
    >(defaultValue);

    let onValueChange = onChange;
    if (!isControlled) {
      onValueChange = (newValue: string) => {
        setUncontrolledValue(newValue);
        onChange?.(newValue);
      };
      value = uncontrolledValue;
    }
    return (
      <TabsContext.Provider
        value={{
          value,
          defaultValue,
          onChange: onValueChange,
          size,
        }}
      >
        <div
          className={cl('ds-tabs', `ds-tabs--${size}`, className)}
          ref={ref}
          {...rest}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

TabsRoot.displayName = 'TabsRoot';
