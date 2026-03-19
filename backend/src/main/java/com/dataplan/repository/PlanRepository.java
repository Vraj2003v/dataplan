package com.dataplan.repository;

import com.dataplan.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    List<Plan> findByCarrierIgnoreCase(String carrier);
    Optional<Plan> findTopByOrderByPriceAsc();
    Optional<Plan> findTopByOrderByDataGbDesc();
    List<Plan> findByIsFeaturedTrue();

    @Query("SELECT p FROM Plan p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(p.carrier) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(p.features) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(p.networkType) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Plan> searchPlans(@Param("q") String query);

    @Query("SELECT p FROM Plan p WHERE p.price <= :maxPrice ORDER BY p.price ASC")
    List<Plan> findByMaxPrice(@Param("maxPrice") Double maxPrice);

    @Query("SELECT p FROM Plan p WHERE p.dataGb >= :minData OR p.dataGb = -1 ORDER BY p.dataGb DESC")
    List<Plan> findByMinData(@Param("minData") Double minData);

    @Query("SELECT p FROM Plan p WHERE UPPER(p.networkType) LIKE UPPER(CONCAT('%',:net,'%'))")
    List<Plan> findByNetworkType(@Param("net") String networkType);

    @Query("SELECT p FROM Plan p WHERE p.dataGb = -1")
    List<Plan> findUnlimitedPlans();
}
