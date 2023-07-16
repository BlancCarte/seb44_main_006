import { debounce } from 'lodash';

import Copy from '../../../assets/Copy';
import { ShareBtn } from '../../../styles/styles';
import showToast from '../../../utils/showToast';

const CopyButton = ({ endpoint }: { endpoint: string }) => {
  const ClickCopy = debounce(() => {
    navigator.clipboard
      .writeText(`https://harumate.netlify.app/${endpoint}`)
      .then(() => {
        showToast('success', '복사 성공!')();
      })
      .catch(() => console.log('복사실패'));
  }, 200);
  return (
    <ShareBtn
      type="button"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        ClickCopy();
      }}
    >
      <Copy />
    </ShareBtn>
  );
};

export default CopyButton;
