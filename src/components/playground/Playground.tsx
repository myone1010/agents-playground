"use client";

import { LoadingSVG } from "@/components/button/LoadingSVG";
import { ChatMessageType } from "@/components/chat/ChatTile";
import { ColorPicker } from "@/components/colorPicker/ColorPicker";
import { AudioInputTile } from "@/components/config/AudioInputTile";
import { ConfigurationPanelItem } from "@/components/config/ConfigurationPanelItem";
import { NameValueRow } from "@/components/config/NameValueRow";
import { PlaygroundHeader } from "@/components/playground/PlaygroundHeader";
import {
  PlaygroundTab,
  PlaygroundTabbedTile,
  PlaygroundTile,
} from "@/components/playground/PlaygroundTile";
import { AgentMultibandAudioVisualizer } from "@/components/visualization/AgentMultibandAudioVisualizer";
import { AgentMultibandAudioWaveVisualizer } from "@/components/visualization/AgentMultibandAudioWaveVisualizer";
import { useConfig } from "@/hooks/useConfig";
import { useAudiobandTrackVolume, useMultibandTrackVolume } from "@/hooks/useTrackVolume";
import { TranscriptionTile } from "@/transcriptions/TranscriptionTile";
import {
  TrackReferenceOrPlaceholder,
  TrackToggle,
  VideoTrack,
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useRemoteParticipants,
  useRoomInfo,
  useTracks,
} from "@livekit/components-react";
import {
  ConnectionState,
  LocalParticipant,
  RoomEvent,
  Track,
} from "livekit-client";
import { QRCodeSVG } from "qrcode.react";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { PlaygroundFooter } from "./PlaygroundFooter";
import { Button } from "../button/Button";
import { useDrawer } from "@/cloud/DrawerProvider";
import { Drawer } from "./Drawer";

export interface PlaygroundMeta {
  name: string;
  value: string;
}

export interface PlaygroundProps {
  logo?: ReactNode;
  themeColors: string[];
  onConnect: (connect: boolean, opts?: { token: string; url: string }) => void;
}

const headerHeight = 80;

export default function Playground({
  logo,
  themeColors,
  onConnect,
}: PlaygroundProps) {
  const { config, setUserSettings } = useConfig();
  const { name } = useRoomInfo();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [transcripts, setTranscripts] = useState<ChatMessageType[]>([]);
  const { localParticipant } = useLocalParticipant();

  const participants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantMetadataChanged],
  });
  const agentParticipant = participants.find((p) => p.isAgent);
  const isAgentConnected = agentParticipant !== undefined;

  const roomState = useConnectionState();
  const tracks = useTracks();

  useEffect(() => {
    if (roomState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(config.settings.inputs.camera);
      localParticipant.setMicrophoneEnabled(config.settings.inputs.mic);
    }
  }, [config, localParticipant, roomState]);

  const [isLg, setIsLg] = useState<boolean>(true)
  const handleWindowSizeChange = () => {
    setIsLg(window.innerWidth >= 1024)
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange)
    return () => window.removeEventListener('resize', handleWindowSizeChange)
  }, [])

  let agentAudioTrack: TrackReferenceOrPlaceholder | undefined;
  const aat = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Audio &&
      trackRef.participant.isAgent
  );

  if (aat) {
    agentAudioTrack = aat;
  } else if (agentParticipant) {
    agentAudioTrack = {
      participant: agentParticipant,
      source: Track.Source.Microphone,
    };
  }

  const agentVideoTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Video &&
      trackRef.participant.isAgent
  );

  const subscribedVolumes = useMultibandTrackVolume(
    agentAudioTrack?.publication?.track,
    5
  );

  const localTracks = tracks.filter(
    ({ participant }) => participant instanceof LocalParticipant
  );
  const localVideoTrack = localTracks.find(
    ({ source }) => source === Track.Source.Camera
  );
  const localMicTrack = localTracks.find(
    ({ source }) => source === Track.Source.Microphone
  );

  const localMultibandVolume = useMultibandTrackVolume(
    localMicTrack?.publication.track,
    20
  );

  // const subscribedAudioVolumes = useAudiobandTrackVolume(
  //   agentAudioTrack?.publication?.track
  // );

  // const localMultibandAudioVolume = useAudiobandTrackVolume(
  //   localMicTrack?.publication.track
  // );

  const onDataReceived = useCallback(
    (msg: any) => {
      if (msg.topic === "transcription") {
        const decoded = JSON.parse(
          new TextDecoder("utf-8").decode(msg.payload)
        );
        let timestamp = new Date().getTime();
        if ("timestamp" in decoded && decoded.timestamp > 0) {
          timestamp = decoded.timestamp;
        }
        setTranscripts([
          ...transcripts,
          {
            name: "You",
            message: decoded.text,
            timestamp: timestamp,
            isSelf: true,
          },
        ]);
      }
    },
    [transcripts]
  );

  useDataChannel(onDataReceived);

  const videoTileContent = useMemo(() => {
    const videoFitClassName = `object-${config.video_fit || "cover"}`;

    const disconnectedContent = (
      <div className="flex items-center justify-center text-gray-700 text-center w-full h-full">
        No video track. Connect to get started.
      </div>
    );

    const loadingContent = (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-700 text-center h-full w-full">
        <LoadingSVG />
        Waiting for video track
      </div>
    );

    const videoContent = (
      <VideoTrack
        trackRef={agentVideoTrack}
        className={`absolute top-1/2 -translate-y-1/2 ${videoFitClassName} object-position-center w-full h-full`}
      />
    );

    let content = null;
    if (roomState === ConnectionState.Disconnected) {
      content = disconnectedContent;
    } else if (agentVideoTrack) {
      content = videoContent;
    } else {
      content = loadingContent;
    }

    return (
      <div className="flex flex-col w-full grow text-gray-950 bg-black rounded-sm border border-gray-800 relative">
        {content}
      </div>
    );
  }, [agentVideoTrack, config, roomState]);

  const audioTileContent = useMemo(() => {
    const disconnectedContent = (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-700 text-center w-full">
        Connect to begin the enchantment
      </div>
    );

    const waitingContent = (
      <div className="flex flex-col items-center gap-2 text-gray-700 text-center w-full">
        <LoadingSVG />
        Loading magic...
      </div>
    );

    // TODO: keep it in the speaking state until we come up with a better protocol for agent states
    const visualizerContent = (
      <div className="flex items-center justify-center w-full">
        <AgentMultibandAudioVisualizer
          state="speaking"
          barWidth={30}
          minBarHeight={30}
          maxBarHeight={150}
          accentColor={config.settings.theme_color}
          accentShade={500}
          frequencies={subscribedVolumes}
          borderRadius={16}
          gap={12}
        />
        {/* <AgentMultibandAudioWaveVisualizer
          state="speaking"
          barWidth={30}
          minBarHeight={30}
          maxBarHeight={150}
          accentColor={config.settings.theme_color}
          accentShade={500}
          // localMicTrack = {localMicTrack?.publication?.track}
          localMicTrack={agentAudioTrack?.publication?.track}
          borderRadius={12}
          gap={16}
        /> */}
      </div>
    );

    if (roomState === ConnectionState.Disconnected) {
      return disconnectedContent;
    }

    if (!agentAudioTrack) {
      return waitingContent;
    }

    return visualizerContent;
  }, [
    agentAudioTrack,
    config.settings.theme_color,
    subscribedVolumes,
    roomState,
    localMicTrack,
  ]);

  const chatTileContent = useMemo(() => {
    if (agentAudioTrack) {
      return (
        <TranscriptionTile
          agentAudioTrack={agentAudioTrack}
          accentColor={config.settings.theme_color}
        />
      );
    }
    return <></>;
  }, [config.settings.theme_color, agentAudioTrack]);

  const settingsTileContent = (
    <div className="flex flex-col gap-4 h-full w-full items-start overflow-y-auto">
      {config.description && (
        <ConfigurationPanelItem title="Description">
          {config.description}
        </ConfigurationPanelItem>
      )}

      <ConfigurationPanelItem title="Settings">
        {localParticipant && (
          <div className="flex flex-col gap-2">
            <NameValueRow
              name="Room"
              value={name}
              valueColor={`${config.settings.theme_color}-500`}
            />
            <NameValueRow
              name="Participant"
              value={localParticipant.identity}
            />
          </div>
        )}
      </ConfigurationPanelItem>
      <ConfigurationPanelItem title="Status">
        <div className="flex flex-col gap-2">
          <NameValueRow
            name="Room connected"
            value={
              roomState === ConnectionState.Connecting ? (
                <LoadingSVG diameter={16} strokeWidth={2} />
              ) : (
                roomState.toUpperCase()
              )
            }
            valueColor={
              roomState === ConnectionState.Connected
                ? `${config.settings.theme_color}-500`
                : "gray-500"
            }
          />
          <NameValueRow
            name="Agent connected"
            value={
              isAgentConnected ? (
                "TRUE"
              ) : roomState === ConnectionState.Connected ? (
                <LoadingSVG diameter={12} strokeWidth={2} />
              ) : (
                "FALSE"
              )
            }
            valueColor={
              isAgentConnected
                ? `${config.settings.theme_color}-500`
                : "gray-500"
            }
          />
        </div>
      </ConfigurationPanelItem>
      {localVideoTrack && (
        <ConfigurationPanelItem
          title="Camera"
          deviceSelectorKind="videoinput"
        >
          <div className="relative">
            <VideoTrack
              className="rounded-sm border border-gray-800 opacity-70 w-full"
              trackRef={localVideoTrack}
            />
          </div>
        </ConfigurationPanelItem>
      )}
      {localMicTrack && (
        <ConfigurationPanelItem
          title="Microphone"
          deviceSelectorKind="audioinput"
        >
          <AudioInputTile frequencies={localMultibandVolume} />
        </ConfigurationPanelItem>
      )}
      <div className="w-full">
        <ConfigurationPanelItem title="Color">
          <ColorPicker
            colors={themeColors}
            selectedColor={config.settings.theme_color}
            onSelect={(color) => {
              const userSettings = { ...config.settings };
              userSettings.theme_color = color;
              setUserSettings(userSettings);
            }}
          />
        </ConfigurationPanelItem>
      </div>
      {config.show_qr && (
        <div className="w-full">
          <ConfigurationPanelItem title="QR Code">
            <QRCodeSVG value={window.location.href} width="128" />
          </ConfigurationPanelItem>
        </div>
      )}
    </div>
  );

  let mobileTabs: PlaygroundTab[] = [];
  if (config.settings.outputs.video) {
    mobileTabs.push({
      title: "Video",
      content: (
        <PlaygroundTile
          className="w-full h-full grow"
          childrenClassName="justify-center"
        >
          {videoTileContent}
        </PlaygroundTile>
      ),
    });
  }

  if (config.settings.outputs.audio) {
    mobileTabs.push({
      title: "Audio",
      content: (
        <PlaygroundTile
          className="w-full h-full grow"
          childrenClassName="justify-center"
        >
          {audioTileContent}
        </PlaygroundTile>
      ),
    });
  }

  if (config.settings.chat) {
    mobileTabs.push({
      title: "Chat",
      content: chatTileContent,
    });
  }

  mobileTabs.push({
    title: "Settings",
    content: (
      <PlaygroundTile
        padding={false}
        backgroundColor="gray-950"
        className="h-full w-full basis-1/4 items-start overflow-y-auto flex"
        childrenClassName="h-full grow items-start"
      >
        {settingsTileContent}
      </PlaygroundTile>
    ),
  });

  const { isOpen, openDrawer, updateDrawer } = useDrawer();
  const openSettings = () => {
    openDrawer(
      <PlaygroundTile
        padding={false}
        backgroundColor="gray-950"
        className="h-full w-full items-start overflow-y-auto max-w-[480px]"
        childrenClassName="h-full grow items-start"
        aria-describedby=""
      >
        {settingsTileContent}
      </PlaygroundTile>
    );
  }

  useEffect(() => {
    if (isOpen) {
      updateDrawer(
        <PlaygroundTile
          padding={false}
          backgroundColor="gray-950"
          className="h-full w-full items-start overflow-y-auto max-w-[480px]"
          childrenClassName="h-full grow items-start"
          aria-describedby=""
        >
          {settingsTileContent}
        </PlaygroundTile>
      );
    }
  }, [
    config.description,
    config.settings,
    config.settings.theme_color,
    config.show_qr,
    localParticipant,
    name,
    roomState,
    isAgentConnected,
    localVideoTrack,
    localMicTrack,
    localMultibandVolume,
    themeColors,
    setUserSettings
  ]);

  return (
    <>
      <PlaygroundHeader
        // title={config.title}
        logo={logo}
        // githubLink={config.github_link}
        height={headerHeight}
        accentColor={config.settings.theme_color}
        connectionState={roomState}
      // onConnectClicked={() =>
      //   onConnect(roomState === ConnectionState.Disconnected)
      // }
      />
      <div
        className={`flex flex-col gap-4 py-4 grow w-full items-center selection:bg-${config.settings.theme_color}-900`}
        style={{ height: `calc(100% - ${headerHeight * 2}px)` }}
      >
        {/* {isLg ?
          <div className="flex flex-col grow basis-1/2 gap-4 h-full lg:hidden">
            <PlaygroundTabbedTile
              className="h-full"
              tabs={mobileTabs}
              initialTab={0}
            />
          </div>
          : */}
        <div
          className={`flex-col gap-4 h-80 w-80 max-w-[90vw] max-h-[90vw]`}
        >
          {/* {config.settings.outputs.video && (
            <PlaygroundTile
              title="Video"
              className="w-full h-full grow"
              childrenClassName="justify-center"
            >
              {videoTileContent}
            </PlaygroundTile>
          )} */}
          {config.settings.outputs.audio && (
            <PlaygroundTile
              // title="Audio"
              className="w-full h-full grow border-8 border-white rounded-3xl bg-gray-500"
              childrenClassName="justify-center"
            >
              {audioTileContent}
            </PlaygroundTile>
          )}
        </div>
        {/* } */}
        <div className={`flex gap-4 w-96 justify-center`}>
          {roomState !== ConnectionState.Connected && roomState !== ConnectionState.SignalReconnecting ? <Button data-state="closed" accentColor="gray" className="audio-track-toggle !rounded-full h-24 w-24" disabled={true}>
            <div className="flex justify-center items-center h-full w-full opacity-80">
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 6H8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 0h-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z" />
              </svg>
            </div>
          </Button>
            :
            <TrackToggle
              className={`audio-track-toggle audio-track-toggle-animation rounded-full h-24 w-24 flex justify-center items-center bg-${config.settings.theme_color}-500 text-gray-700 border border-gray-800 hover:bg-${config.settings.theme_color}-400 [&>svg]:scale-[2.5]`}
              source={Track.Source.Microphone}
            />
          }
        </div>
        {/* {config.settings.chat && (
          <PlaygroundTile
            title="Chat"
            className="h-full grow basis-1/4 hidden lg:flex"
          >
            {chatTileContent}
          </PlaygroundTile>
        )} */}
      </div>
      <PlaygroundFooter
        // title={config.title}
        // logo={logo}
        // githubLink={config.github_link}
        height={headerHeight}
        accentColor={config.settings.theme_color}
        connectionState={roomState}
        onConnectClicked={() =>
          onConnect(roomState === ConnectionState.Disconnected)
        }
        onSettingClicked={openSettings}
      />
      <Drawer />
    </>
  );
}