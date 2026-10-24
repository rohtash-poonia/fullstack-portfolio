import { preconnect, preload } from 'react-dom';

export const ROBOT_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';
export const loadSpline = () => import('@splinetool/react-spline');

export function preloadRobot() {
  preconnect('https://prod.spline.design', { crossOrigin: 'anonymous' });
  preload(ROBOT_SCENE, { as: 'fetch', crossOrigin: 'anonymous' });
  return loadSpline();
}
