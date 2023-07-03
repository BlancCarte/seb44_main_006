import { styled } from 'styled-components';

import { IconStyle } from '../types/type';

const Svg = styled.svg`
  position: absolute;
  top: 12px;
  right: 20px;
  cursor: pointer;
`;

const Search = ({
  style,
  onClick,
}: {
  style: IconStyle;
  onClick: () => void;
}) => {
  return (
    <Svg
      onClick={onClick}
      width={style.width}
      height={style.width}
      viewBox="0 0 27 27"
      fill={style.color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26 26L19.9681 19.9681M19.9681 19.9681C20.9999 18.9363 21.8183 17.7115 22.3767 16.3634C22.9351 15.0153 23.2225 13.5704 23.2225 12.1113C23.2225 10.6521 22.9351 9.20725 22.3767 7.85917C21.8184 6.51109 20.9999 5.28619 19.9681 4.25442C18.9363 3.22264 17.7115 2.40419 16.3634 1.8458C15.0153 1.2874 13.5704 1 12.1113 1C10.6521 1 9.20725 1.2874 7.85917 1.8458C6.51109 2.40419 5.28619 3.22264 4.25442 4.25442C2.17065 6.33818 1 9.16438 1 12.1113C1 15.0582 2.17065 17.8844 4.25442 19.9681C6.33818 22.0519 9.16438 23.2225 12.1113 23.2225C15.0582 23.2225 17.8844 22.0519 19.9681 19.9681Z"
        stroke="#616161"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Search;