package com.seb_main_006.domain.course.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CourseInfoDto {

    private Long courseId;
    private List<DestinationPostDto> destinationList;
}