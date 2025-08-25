
import { useRef } from "react";

const CardItem = (props: {
  id: number,
  index: number,
  isFlipped: boolean,
  setCardState: (cardIndex: number, cardValue: number) => void,
  size?: 'small' | 'smaller',
  level: number
}) => {

  const theOpacity = props.isFlipped ? '0' : '1';
  const divRef = useRef<HTMLDivElement>(null);
  const timeOutId = useRef(0);

  const sizeClass = props.size === 'small'
    ? 'w-32 h-32'
    : props.size === 'smaller'
    ? 'w-24 h-24'
    : 'w-20 h-20';

  const imgSrc = props.level === 1
    ? `assets/fruits/${props.id + 1}.png`
    : props.level === 2
    ? `assets/emojis/${props.id + 1}.png`
    : `assets/flags/${props.id + 1}.png`;

  return (
    <div
      className={`transition-all duration-500 relative rounded-lg overflow-hidden card-item m-1 cursor-pointer ${sizeClass}`}
      style={{ opacity: theOpacity }}
      onClick={() => {
        props.setCardState(props.index, props.id);

        if (divRef.current) {
          divRef.current.style.display = 'none';
        }

        clearTimeout(timeOutId.current);
        timeOutId.current = window.setTimeout(() => {
          if (divRef.current) {
            divRef.current.style.display = 'block';
          }
        }, 1000);
      }}
    >
      <img
        src={imgSrc}
        alt=""
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
      />
      <div
        ref={divRef}
        className="absolute top-0 left-0 w-full h-full bg-orange-500"
      ></div>
    </div>
  );
};

export default CardItem;
