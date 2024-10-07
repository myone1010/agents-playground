import { useDrawer } from "@/cloud/DrawerProvider";
import { Button } from "@/components/button/Button";
import { LoadingSVG } from "@/components/button/LoadingSVG";
// import { SettingsDropdown } from "@/components/playground/SettingsDropdown";
// import { useConfig } from "@/hooks/useConfig";
import { ConnectionState } from "livekit-client";
// import { ReactNode } from "react";

type PlaygroundFooter = {
  // logo?: ReactNode;
  // title?: ReactNode;
  // githubLink?: string;
  height: number;
  accentColor: string;
  connectionState: ConnectionState;
  onConnectClicked: () => void;
  onSettingClicked: () => void;
};

export const PlaygroundFooter = ({
  accentColor,
  height,
  onConnectClicked,
  connectionState,
  onSettingClicked,
}: PlaygroundFooter) => {
  // const { config } = useConfig();
  return (
    <div
      className={`flex gap-4 pt-4 text-${accentColor}-500 justify-end items-center shrink-0`}
      style={{
        height: height + "px",
      }}
    >
      <div className="flex basis-1/3 justify-end items-center gap-2">
        {/* {config.settings.editable && <SettingsDropdown />} */}
        <Button accentColor={accentColor} className="inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-xl border text-base font-semibold ring-ring transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-5 border-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:text-primary-foreground/50 h-12 px-2 py-2 ml-auto"
        onClick={onSettingClicked}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z" />
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          </svg>
        </Button>
        <Button
          accentColor={
            accentColor // connectionState === ConnectionState.Connected ? "red" : 
          }
          disabled={connectionState === ConnectionState.Connecting}
          onClick={() => {
            onConnectClicked();
          }}
          className="inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-xl border text-base font-semibold ring-ring transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-5 border-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:text-primary-foreground/50 h-12 px-6 py-2"
        >
          {connectionState === ConnectionState.Connecting ? (
            <LoadingSVG />
          ) : connectionState === ConnectionState.Connected ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
              End
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2" />
              </svg>
              Connect
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
