import * as React from "react";

export type LogoIconProps = React.ComponentPropsWithoutRef<"svg"> & {
  title?: string;
  titleId?: string;
};

export const LogoIcon = React.forwardRef<SVGSVGElement, LogoIconProps>(
  ({ title, titleId, ...props }, ref) => {
    const autoId = React.useId();
    const resolvedTitleId = title ? (titleId ?? autoId) : undefined;

    return (
      <svg
        ref={ref}
        viewBox="0 0 142 142"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={title ? undefined : true}
        role={title ? "img" : "presentation"}
        aria-labelledby={title ? resolvedTitleId : undefined}
        {...props}
      >
        {title ? <title id={resolvedTitleId}>{title}</title> : null}

        <path
          d="M0 5C0 2.23858 2.23858 0 5 0H107C109.761 0 112 2.23858 112 5V30H0V5Z"
          fill="currentColor"
        />
        <path
          d="M137 30C139.761 30 142 32.2386 142 35V137C142 139.761 139.761 142 137 142H112V30H137Z"
          fill="currentColor"
        />
        <path
          d="M97 73V142H72C69.2386 142 67 139.761 67 137V73H97Z"
          fill="currentColor"
        />
        <path
          d="M67 73H5C2.23858 73 0 70.7614 0 68V43H67V73Z"
          fill="currentColor"
        />
        <path
          d="M82 0H107C109.761 0 112 2.23858 112 5V58H82V0Z"
          fill="currentColor"
        />
        <path
          d="M0 117H54V142H5C2.23858 142 0 139.761 0 137V117Z"
          fill="currentColor"
        />
        <path
          d="M25 88V142H5C2.23858 142 0 139.761 0 137V88H25Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

LogoIcon.displayName = "LogoIcon";
