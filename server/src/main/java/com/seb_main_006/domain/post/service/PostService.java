package com.seb_main_006.domain.post.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.seb_main_006.domain.bookmark.repository.BookmarkRepository;
import com.seb_main_006.domain.course.entity.Course;
import com.seb_main_006.domain.course.service.CourseService;
import com.seb_main_006.domain.like.repository.LikesRepository;
import com.seb_main_006.domain.member.entity.Member;
import com.seb_main_006.domain.member.service.MemberService;
import com.seb_main_006.domain.post.dto.PostDataForList;
import com.seb_main_006.domain.post.dto.PostListResponseDto;
import com.seb_main_006.domain.post.dto.PostPostDto;
import com.seb_main_006.domain.post.entity.Post;
import com.seb_main_006.domain.post.entity.PostTag;
import com.seb_main_006.domain.post.repository.PostRepository;
import com.seb_main_006.domain.post.repository.PostTagRepository;
import com.seb_main_006.domain.tag.entity.Tag;
import com.seb_main_006.domain.tag.repository.TagRepository;
import com.seb_main_006.global.auth.jwt.JwtTokenizer;
import com.seb_main_006.global.auth.jwt.Subject;
import com.seb_main_006.global.exception.BusinessLogicException;
import com.seb_main_006.global.exception.ExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final MemberService memberService;
    private final CourseService courseService;
    private final TagRepository tagRepository;
    private final PostRepository postRepository;
    private final PostTagRepository postTagRepository;
    private final LikesRepository likesRepository;
    private final BookmarkRepository bookmarkRepository;
    private final JwtTokenizer jwtTokenizer;

    public Post createPost(PostPostDto postPostDto, String memberEmail) {

        Member findmember = memberService.findVerifiedMember(memberEmail);
        Course findcourse = courseService.findVerifiedCourse(postPostDto.getCourseId());

        courseService.verifyMyCourse(findmember, findcourse); //코스 작성자와 현재 로그인한 작성자가 동일한지 확인

        verifyExistCourse(findcourse); //작성한 코스가 있으면 예외처리

        Post post = new Post(); //새로 저장할 Post 선언

        post.setPostContent(postPostDto.getCourseContent()); //저장할 post에 게시글내용과 코스 저장

        post.setCourse(findcourse); //Post에 코스 저장(연관관계 매핑)

        List<String> inputTags = postPostDto.getTags(); //입력받은 태그 리스트를 postPostDto에서 꺼내옴

        //입력받은 태그 리스트의 길이만큼 반복
        for(int i=0; i<inputTags.size(); i++){

            String tagName = inputTags.get(i); //입력받은 태그 이름 인덱스로 꺼내옴

            PostTag newPostTag = new PostTag(); //저장할 새로운 PostTag선언

            Optional<Tag> optionalTag = tagRepository.findByTagName(tagName); //Tag테이블에서 tagName으로 값이 존재하는 지 확인

            // 존재할 경우 newPostTag에 가져온 tag 저장
            if(optionalTag.isPresent()){
               Tag findTag = optionalTag.get();
                newPostTag.setTag(findTag);
            }
            // 존재하지 않을 경우 tag테이블에 저장 후 newPostTag에 저장
            else{
                newPostTag.setTag(tagRepository.save(new Tag(tagName)));
            }
            newPostTag.setPost(post); // new PostTag에 Post세팅(연관관계 매핑)
            post.getPostTagsInPost().add(newPostTag);// post의 PostTagsInpost리스트에 newPostTag 추가(연관관계 매핑)
        }
        //Post 테이블에 저장
        return postRepository.save(post);
    }


    /**
     * 태그로 게시글 조회
     */
    public PostListResponseDto getPostListByTag(String tagName, int page, int limit, String sort, String accessToken) throws JsonProcessingException {

        Member member = new Member(0L);
        PageRequest pageRequest = PageRequest.of(page, limit);

        if (accessToken != null) {
            String memberEmail = jwtTokenizer.getSubject(accessToken).getUsername();
            member = memberService.findVerifiedMember(memberEmail);
        }


        // 1. tagName 으로 tag 찾기 (이때 검색하는 키워드가 포함된 태그도 같이 검색되도록)  -> List<Tag>
        List<Tag> findTagList = tagRepository.findByTagNameContaining(tagName);

        // 2. PostTag 테이블에서 1에서 찾은 태그들이 포함된 데이터 조회 -> List<PostTag> -> List<Post> 로 변환
        Page<Course> pageResult = postTagRepository.findByTagIn(findTagList, pageRequest);

        // 3. 응답 데이터 형식으로 변환해서 리턴
        // 없는 데이터 : likeStatus, bookmarkStatus 끗
        List<PostDataForList> postDataList = new ArrayList<>();

        for (Course course : pageResult.getContent()) {
            boolean likeStatus = likesRepository.findByMemberAndCourse(member, course).isPresent();
            boolean bookmarkStatus = bookmarkRepository.findByMemberAndCourse(member, course).isPresent();
            PostDataForList postData = PostDataForList.of(course, likeStatus, bookmarkStatus);
            postDataList.add(postData);
        }

        if (sort == null) {
            postDataList = postDataList.stream().sorted(Comparator.comparing(PostDataForList::getCourseUpdatedAt).reversed()).collect(Collectors.toList());
        } else {
            postDataList = postDataList.stream().sorted(Comparator.comparing(PostDataForList::getCourseLikeCount).reversed()).collect(Collectors.toList());
        }

        return new PostListResponseDto(postDataList, pageResult);
    }


    public void verifyNoExistPost(Course course){
        postRepository.findByCourse(course).orElseThrow(() -> new BusinessLogicException(ExceptionCode.CANT_LIKE_NOT_FOUND));
    }

    //해당 코스로 작성된 게시글이 있는지 확인하는 메소드
    private void verifyExistCourse(Course course){
        if(postRepository.findByCourse(course).isPresent()){
            throw new BusinessLogicException(ExceptionCode.POST_EXISTS);
        }
    }

    //코스로 작성된 게시글이 있으면 그 게시글 리턴 없으면 예외
    public Post findVerifiedPost(Course course) {
        return postRepository.findByCourse(course)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.POST_NOT_FOUND));
    }
}