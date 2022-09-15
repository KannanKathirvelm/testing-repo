import { AudioResourceComponent } from '@components/player/resources/audio-resource/audio-resource.component';
import { ImageResourceComponent } from '@components/player/resources/image-resource/image-resource.component';
import { InteractiveResourceComponent } from '@components/player/resources/interactive-resource/interactive-resource.component';
import { TextResourceComponent } from '@components/player/resources/text-resource/text-resource.component';
import { VideoResourceComponent } from '@components/player/resources/video-resource/video-resource.component';
import { WebpageResourceComponent } from '@components/player/resources/webpage-resource/webpage-resource.component';


export const RESOURCES = [
  AudioResourceComponent,
  ImageResourceComponent,
  InteractiveResourceComponent,
  TextResourceComponent,
  WebpageResourceComponent,
  VideoResourceComponent
];


export const RESOURCE_TYPES = {
  audio_resource: AudioResourceComponent,
  image_resource: ImageResourceComponent,
  interactive_resource: InteractiveResourceComponent,
  text_resource: TextResourceComponent,
  webpage_resource: WebpageResourceComponent,
  video_resource: VideoResourceComponent
};
