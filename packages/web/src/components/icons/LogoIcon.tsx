export type Props = React.ComponentPropsWithoutRef<'svg'>;

export const LogoIcon: React.FC<Props> = (props) => {
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" fill="none" {...props}>
      <path
        d="M18.5137 40.0257H24.9376C25.7724 40.0257 26.5557 39.6185 27.0409 38.9325L39.1913 21.7524H32.7673C31.9326 21.7524 31.1492 22.1596 30.664 22.8456L18.5137 40.0257Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M35.873 19.3479H32.1184C31.0119 19.3479 29.9735 19.8837 29.3304 20.7863L15.7265 39.8794C6.85641 38.7471 0 31.1706 0 21.9927C0 12.0335 8.07355 3.95996 18.0328 3.95996C27.0936 3.95996 34.5935 10.6425 35.873 19.3479Z"
        fill="currentColor"
      />
      <path
        d="M29.0928 40.0256H33.724C34.3258 40.0256 34.8905 39.7363 35.2403 39.2489L43.9999 27.042H39.3686C38.7669 27.042 38.2021 27.3313 37.8523 27.8187L29.0928 40.0256Z"
        fill="currentColor"
      />
    </svg>
  );
};
