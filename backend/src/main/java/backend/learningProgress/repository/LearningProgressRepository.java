package backend.learningProgress.repository;

import backend.learningProgress.model.LearningProgressModel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LearningProgressRepository extends MongoRepository<LearningProgressModel, String> {
    void deleteByPostOwnerID(String postOwnerID); // Ensure this method exists
}
