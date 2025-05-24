const chalk = require('chalk');
const { readFile, writeFile, copyFile } = require('fs').promises;

function log(...args) {
  console.log(chalk.yellow('[react-native-maps]'), ...args);
}

async function reactNativeMaps() {
  const modulePath = 'node_modules/react-native-maps';
  try {
    // Create a basic web implementation
    const webImplementation = `
import React from 'react';
import { View } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export const Marker = ({ coordinate, title, description }) => (
  <View style={{ position: 'absolute', left: coordinate.longitude, top: coordinate.latitude }}>
    <div title={title}>{description}</div>
  </View>
);

export default function MapView({ children, style, initialRegion, showsUserLocation, showsMyLocationButton }) {
  return (
    <View style={[style, { backgroundColor: '#f0f0f0' }]}>
      <div style={{ padding: 20, textAlign: 'center' }}>
        Map View (Web Preview)
        <div style={{ fontSize: 12, color: '#666' }}>
          {initialRegion && \`Center: \${initialRegion.latitude.toFixed(4)}, \${initialRegion.longitude.toFixed(4)}\`}
        </div>
      </div>
      {children}
    </View>
  );
}
`;

    await writeFile(`${modulePath}/lib/index.web.js`, webImplementation, 'utf-8');
    log('   Created web module: index.web.js');
    
    // Copy type definitions
    await copyFile(`${modulePath}/lib/index.d.ts`, `${modulePath}/lib/index.web.d.ts`);
    log('   Copied type definitions: index.web.d.ts');
    
    // Update package.json
    const pkg = JSON.parse(await readFile(`${modulePath}/package.json`));
    pkg['react-native'] = 'lib/index.js';
    pkg['main'] = 'lib/index.web.js';
    await writeFile(`${modulePath}/package.json`, JSON.stringify(pkg, null, 2), 'utf-8');
    log('   Updated package.json');

  } catch (error) {
    log('Error during script execution:', error);
  }
}

reactNativeMaps();