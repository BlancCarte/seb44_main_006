import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { PostReqT } from '../types/apitype';

const PROXY = window.location.hostname === 'localhost' ? '' : '/proxy';
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

export const instance = axios.create({
  baseURL: PROXY,
  headers: {
    'Content-Type': 'application/json',
    Authorization: accessToken,
    RefreshToken: refreshToken,
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers.Authorization = accessToken;
    config.headers.RefreshToken = refreshToken;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// TODO:refrashtoken 응답요청 하기
//* 기존 API 호출하다 444 에러코드 응답 시 reissue 로 헤더 그대로 호출시 재발급
//* reissue 호출에 대한 응답까지도 444 일 경우 refreshToken도 만료된 상황이므로 다시 로그인이 필요
// instance.interceptors.response.use(

// );

export const GetUserInfo = async () => instance.get(`/api/auth/members`);

export const RemoveUserInfo = async () => instance.post('/api/auth/logout');

export const GetAainUserToken = async () => instance.post('/auth/reissue');

export const PatchUserNickname = async () => instance.patch('/auth/members');

export const GetMyList = async () => instance.get(`/api/members`);

export const GetCourse = async ({ courseId }: { courseId: string }) =>
  instance.get(`/api/courses/${courseId}`);

export const GetCommunityList = async ({
  page,
  limit,
  sort,
  tagName,
}: {
  page: number;
  limit: number;
  sort?: string | undefined;
  tagName?: string | undefined;
}) => {
  const essential = `/api/posts/read?page=${page}&limit=${limit}`;
  const optSort = sort === 'Like' ? '&sort=like' : '';
  const optTagName = tagName ? `&tagName=${tagName}` : '';
  const request = essential + optSort + optTagName;
  return instance.get(request);
};

export const GetCommunityPost = async ({ postId }: { postId: string }) =>
  instance.get(`/api/posts/read/${postId}`);

export const PostCommunity = async ({
  courseId,
  postContent,
  tags,
}: PostReqT) => instance.post(`/api/posts/`, { courseId, postContent, tags });

export const PostComment = async ({
  answerContent,
  postId,
}: {
  answerContent: string;
  postId: string | undefined;
}) => instance.post(`/api/answers/${postId ?? ''}`, { answerContent });

export const DeleteCommunityPost = async ({ postId }: { postId: string }) =>
  instance.delete(`/api/posts/${postId}`);

export const PostBookmark = async ({ courseId }: { courseId: number }) =>
  instance.post(`/api/courses/${courseId}/bookmark`);

export const PostLike = async ({ courseId }: { courseId: number }) =>
  instance.post(`/api/courses/${courseId}/like`);

export const DeleteComment = async ({ answerId }: { answerId: number }) =>
  instance.delete(`/api/answers/${answerId}`);

export const PatchComment = async ({
  answerId,
  answerContent,
}: {
  answerId: number;
  answerContent: string;
}) => instance.patch(`/api/answers/${answerId}`, { answerContent });
