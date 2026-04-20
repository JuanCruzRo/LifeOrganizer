"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { FiCheck, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <DropdownMenuPortal>
    <DropdownMenuPrimitive.Content
      className={cn(
        "z-50 min-w-[14rem] overflow-hidden rounded-2xl border border-[rgba(31,41,55,0.08)] bg-[rgba(255,255,255,0.96)] p-1.5 text-[var(--foreground)] shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl outline-none",
        "data-[side=bottom]:animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:animate-in data-[side=top]:slide-in-from-bottom-2",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
        className
      )}
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    />
  </DropdownMenuPortal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    className={cn(
      "px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]",
      className
    )}
    ref={ref}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    className={cn("my-1 h-px bg-[rgba(31,41,55,0.08)]", className)}
    ref={ref}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "relative flex cursor-default select-none items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium outline-none transition data-[disabled]:pointer-events-none data-[highlighted]:bg-[rgba(244,114,36,0.12)] data-[highlighted]:text-[var(--foreground)] data-[disabled]:opacity-40",
      inset && "pl-8",
      className
    )}
    ref={ref}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    className={cn(
      "relative flex cursor-default select-none items-center gap-3 rounded-[1rem] px-3 py-2.5 pr-10 text-sm font-medium outline-none transition data-[disabled]:pointer-events-none data-[highlighted]:bg-[rgba(244,114,36,0.12)] data-[highlighted]:text-[var(--foreground)] data-[state=checked]:bg-[rgba(244,114,36,0.16)] data-[disabled]:opacity-40",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
    <DropdownMenuPrimitive.ItemIndicator className="absolute right-3 inline-flex items-center justify-center text-[var(--accent)]">
      <FiCheck className="h-4 w-4" />
    </DropdownMenuPrimitive.ItemIndicator>
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span className={cn("ml-auto text-xs font-medium text-[var(--muted)]", className)} {...props} />
);

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-[1rem] px-3 py-2.5 text-sm outline-none transition data-[state=open]:bg-[rgba(244,114,36,0.12)] data-[highlighted]:bg-[rgba(244,114,36,0.12)]",
      inset && "pl-8",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
    <FiChevronRight className="ml-auto h-4 w-4 text-[var(--muted)]" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    className={cn(
      "z-50 min-w-[12rem] overflow-hidden rounded-2xl border border-[rgba(31,41,55,0.08)] bg-[rgba(255,255,255,0.96)] p-1.5 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl outline-none",
      "data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
      className
    )}
    ref={ref}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
};
