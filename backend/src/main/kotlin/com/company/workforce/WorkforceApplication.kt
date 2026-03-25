package com.company.workforce

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class WorkforceApplication

fun main(args: Array<String>) {
    runApplication<WorkforceApplication>(*args)
}
