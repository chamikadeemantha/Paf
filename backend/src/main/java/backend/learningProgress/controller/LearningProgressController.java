package backend.learningProgress.controller;

import backend.exception.ResourceNotFoundException;
import backend.learningProgress.model.LearningProgressModel;
import backend.learningProgress.repository.LearningProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost:3000")
public class LearningProgressController {
    @Autowired
    private LearningProgressRepository learningProgressRepository;
    private final Path root = Paths.get("uploads/mealprogress");
    //Insert
    @PostMapping("/mealprogress")
    public LearningProgressModel newAchievementsModel(@RequestBody LearningProgressModel newLearningProgressModel) {
        return learningProgressRepository.save(newLearningProgressModel);
    }

    @PostMapping("/mealprogress/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename; // Returns just the random filename
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    @GetMapping("/mealprogress")
    List<LearningProgressModel> getAll() {
        return learningProgressRepository.findAll();
    }

    @GetMapping("/mealprogress/{id}")
    LearningProgressModel getById(@PathVariable String id) {
        return learningProgressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    @PutMapping("/mealprogress/{id}")
    LearningProgressModel update(@RequestBody LearningProgressModel newLearningProgressModel, @PathVariable String id) {
        return learningProgressRepository.findById(id)
                .map(learningProgressModel -> {
                    learningProgressModel.setTitle(newLearningProgressModel.getTitle());
                    learningProgressModel.setDescription(newLearningProgressModel.getDescription());
                    learningProgressModel.setPostOwnerID(newLearningProgressModel.getPostOwnerID());
                    learningProgressModel.setPostOwnerName(newLearningProgressModel.getPostOwnerName());
                    learningProgressModel.setDate(newLearningProgressModel.getDate());
                    learningProgressModel.setCategory(newLearningProgressModel.getCategory());
                    learningProgressModel.setImageUrl(newLearningProgressModel.getImageUrl());
                    return learningProgressRepository.save(learningProgressModel);
                }).orElseThrow(() -> new ResourceNotFoundException(id));
    }

    @DeleteMapping("/mealprogress/{id}")
    public void delete(@PathVariable String id) {
        learningProgressRepository.deleteById(id);
    }

    @GetMapping("/mealprogress/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Error loading image: " + e.getMessage());
        }
    }
}
