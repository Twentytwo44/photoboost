export type LayoutType = '4-cut' | '6-cut' | '2-cut' | '2x2' | '1-cut';

export interface FrameConfig {
  bgColor: string;      // background color of the frame
  textColor: string;    // text color of the caption
  text: string;         // bottom caption text
  fontFamily: string;   // font family for the text
  layout: LayoutType;   // active layout type
  aspectRatio: number;  // aspect ratio of individual photos
}

export const DEFAULT_FRAME_CONFIG: FrameConfig = {
  bgColor: '#ffffff',
  textColor: '#1a1a1a',
  text: 'MEMORIES',
  fontFamily: 'serif',
  layout: '4-cut',
  aspectRatio: 4 / 3,
};
