import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from 'styled-components';

import useKeywordSearch from '../../hooks/useKeywordSearch';
import { Pagination, PlacesSearchResultItem } from '../../types/type';
import { RootState } from '../../store';
import LocationCard from '../ui/cards/LocationCard';
import cssToken from '../../styles/cssToken';
import { showDetailActions } from '../../store/showDetail-slice';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${cssToken.SPACING['gap-16']};
`;

const PaginationWrapper = styled.section`
  width: 100px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const PlaceList = ({
  searchPlace,
  radius,
}: {
  searchPlace: string | undefined;
  radius?: number;
}) => {
  const places = useSelector((state: RootState) => state.placeList.list);
  const schedule = useSelector(
    (state: RootState) => state.scheduleList.lastItem
  );
  const paginationRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const displayPagination = useCallback((pagination: Pagination) => {
    const fragment = document.createDocumentFragment();

    while (paginationRef.current?.firstChild) {
      paginationRef.current.removeChild(paginationRef.current.firstChild);
    }

    for (let i = 1; i <= pagination.last; i += 1) {
      const el = document.createElement('a');
      el.href = '#';
      el.innerHTML = `${i}`;

      if (i === pagination.current) {
        el.className = 'on';
      } else {
        el.onclick = ((idx) => {
          return () => {
            pagination.gotoPage(idx);
          };
        })(i);
      }

      fragment.appendChild(el);
    }
    paginationRef.current?.appendChild(fragment);
  }, []);

  useKeywordSearch(
    displayPagination,
    searchPlace,
    schedule.x,
    schedule.y,
    radius ? radius * 1000 : undefined
  );

  const handleClick = (item: PlacesSearchResultItem) => {
    dispatch(showDetailActions.setIsShow(true));
    dispatch(showDetailActions.setItem(item));
  };

  return (
    <Wrapper>
      {places.map((item: PlacesSearchResultItem) => (
        <LocationCard
          key={item.id}
          title={item.place_name}
          category={item.category_name ? item.category_name.split('>')[0] : ''}
          address={item.road_address_name}
          phone={item.phone}
          onClick={() => handleClick(item)}
        />
      ))}
      <PaginationWrapper ref={paginationRef} />
    </Wrapper>
  );
};

export default PlaceList;
