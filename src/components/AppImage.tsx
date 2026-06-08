import React from 'react';
import { StyleSheet } from 'react-native';
import FastImage, {
  FastImageProps,
  ResizeMode,
} from '@d11/react-native-fast-image';

interface AppImageProps extends Omit<FastImageProps, 'source'> {
  /**
   * Accept either a local module (number from require/import) or a string uri
   * or a FastImage source object. This makes the component usable with
   * imported static assets like `import img from './x.png'` as well as
   * remote URLs.
   */
  source: number | string | { uri: string };
  fallbackElement?: React.ReactNode; // renamed to avoid clash
  resizeMode?: ResizeMode;
}

const AppImage: React.FC<AppImageProps> = ({
  source,
  style,
  resizeMode = FastImage.resizeMode.cover,
  ...rest
}) => {
  // Normalize the source for FastImage. If a string is given, treat it as a remote uri.
  let fastImageSource: any;
  if (typeof source === 'string') {
    fastImageSource = {
      uri: source,
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    };
  } else if (typeof source === 'number') {
    // local asset returned by require/import
    fastImageSource = source;
  } else {
    // assume it's already a { uri: string }-like object
    fastImageSource = {
      ...source,
      priority: (source as any).priority ?? FastImage.priority.normal,
      cache: (source as any).cache ?? FastImage.cacheControl.immutable,
    };
  }

  return (
    <FastImage
      style={[styles.base, style]}
      source={fastImageSource}
      resizeMode={resizeMode}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#1a1a1f', // matches HashCave's dark bg while loading
  },
});

export default AppImage;
