package com.bookmyplay.service.impl;

import com.bookmyplay.entity.Category;
import com.bookmyplay.entity.Coupon;
import com.bookmyplay.entity.Review;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.repository.CategoryRepository;
import com.bookmyplay.repository.CouponRepository;
import com.bookmyplay.repository.ReviewRepository;
import com.bookmyplay.repository.VenueRepository;
import com.bookmyplay.service.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIServiceImpl implements AIService {

    private final VenueRepository venueRepository;
    private final CategoryRepository categoryRepository;
    private final CouponRepository couponRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public String getAIChatResponse(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "Please ask a question, and I will be happy to help!";
        }

        String lowerMessage = message.toLowerCase();

        // 1. Try Gemini API if key is available in environment
        String geminiApiKey = System.getenv("GEMINI_API_KEY");
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                return callGeminiApi(message, geminiApiKey);
            } catch (Exception e) {
                log.error("Error calling Gemini API, falling back to local search rules", e);
            }
        }

        // 2. Local Fallback Search Engine (Grounding on real DB data)
        return getLocalFallbackResponse(lowerMessage);
    }

    private String callGeminiApi(String userMessage, String apiKey) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        // Fetch DB Context
        List<Venue> venues = venueRepository.findAll();
        List<Category> categories = categoryRepository.findAll();
        List<Coupon> coupons = couponRepository.findAll().stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                .toList();

        // Build context description
        StringBuilder context = new StringBuilder();
        context.append("You are BookMyPlay AI, a smart sports booking assistant. Here is the actual database content you can use:\n\n");
        
        context.append("Sports Categories available:\n");
        for (Category cat : categories) {
            context.append("- ").append(cat.getCategoryName()).append(" (ID: ").append(cat.getId()).append(")\n");
        }
        
        context.append("\nActive Coupons & Offers:\n");
        for (Coupon c : coupons) {
            context.append("- ").append(c.getCouponCode()).append(": ").append(c.getDiscount()).append("% off. Status: ").append(c.getStatus()).append("\n");
        }

        context.append("\nVenues listed on BookMyPlay:\n");
        for (Venue v : venues) {
            context.append("- ID: ").append(v.getId())
                    .append(", Name: ").append(v.getVenueName())
                    .append(", Sport: ").append(v.getCategory().getCategoryName())
                    .append(", City: ").append(v.getCity())
                    .append(", Price: ₹").append(v.getPricePerHour()).append("/hr")
                    .append(", Address: ").append(v.getAddress())
                    .append(", Timings: ").append(v.getOpenTime()).append(" - ").append(v.getCloseTime())
                    .append("\n");
        }

        context.append("\nInstruction:\n");
        context.append("1. Keep recommendations grounded strictly in the data provided above. Do not hallucinate fake venues.\n");
        context.append("2. When suggesting a venue, format its name in bold and output the exact relative URL: [View Details](/venue/ID) where ID is the venue ID.\n");
        context.append("3. Keep answers concise, helpful, and professional in markdown format.\n");

        // Format prompt
        String prompt = context.toString() + "\nUser question: " + userMessage;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contentMap = new HashMap<>();
        Map<String, Object> partMap = new HashMap<>();
        partMap.put("text", prompt);
        contentMap.put("parts", Collections.singletonList(partMap));
        requestBody.put("contents", Collections.singletonList(contentMap));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map body = response.getBody();
            List candidates = (List) body.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map candidate = (Map) candidates.get(0);
                Map responseContent = (Map) candidate.get("content");
                if (responseContent != null) {
                    List parts = (List) responseContent.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map part = (Map) parts.get(0);
                        return (String) part.get("text");
                    }
                }
            }
        }
        throw new RuntimeException("Unexpected response format from Gemini API");
    }

    private String getLocalFallbackResponse(String message) {
        // A. Static FAQ responses
        if (message.contains("cancel") || message.contains("policy") || message.contains("refund")) {
            return "**Cancellation & Refund Policy:**\n\n" +
                    "- Bookings can be cancelled up to **24 hours prior** to the scheduled slot start time for a full refund.\n" +
                    "- Cancellations made within 24 hours of the slot start time are non-refundable.\n" +
                    "- Refunds are automatically processed back to your original payment method within **5-7 business days**.";
        }
        if (message.contains("how do i book") || message.contains("how to book") || message.contains("booking help") || message.contains("step to book")) {
            return "**How to Book a Sports Venue:**\n\n" +
                    "1. Browse through the available sports categories or use the search bar on the Home page.\n" +
                    "2. Select the venue you like to see details, reviews, and maps.\n" +
                    "3. Choose your desired date and click one or more available time slots.\n" +
                    "4. Proceed to booking, apply coupons if any, and pay securely online.\n" +
                    "5. Your booking confirmation and details will be available on your **User Dashboard > My Bookings**.";
        }
        if (message.contains("payment") || message.contains("pay")) {
            return "**Payment Methods:**\n\n" +
                    "- We accept all secure payment methods: Credit/Debit Cards, UPI, Net Banking, and major mobile wallets.\n" +
                    "- All payments are processed through safe, encrypted, and certified payment gateways.";
        }
        if (message.contains("register as vendor") || message.contains("vendor registration") || message.contains("partner") || message.contains("list my venue") || message.contains("add my turf")) {
            return "**Vendor Registration & Listing:**\n\n" +
                    "- You can partner with BookMyPlay by registering a vendor account on our **[Register Page](/register)**.\n" +
                    "- Once registered, choose **Vendor** role, log in, and you will have full access to add venues, create custom slots, configure pricing, and track slot booking analytics.";
        }
        if (message.contains("support") || message.contains("contact") || message.contains("help") || message.contains("customer care")) {
            return "**BookMyPlay Customer Support:**\n\n" +
                    "- 📧 **Email Support:** support@bookmyplay.com\n" +
                    "- 📞 **Phone Support:** +1-800-PLAY-NOW (Toll Free)\n" +
                    "- ⏰ **Operational Hours:** Monday to Sunday (9:00 AM - 9:00 PM)";
        }
        if (message.contains("account") || message.contains("profile") || message.contains("dashboard")) {
            return "**Account & Profile Management:**\n\n" +
                    "- You can manage your details in your **Dashboard** once logged in.\n" +
                    "- Track your active bookings, view notifications, save favorite venues, write reviews, and update your profile details under the user settings tab.";
        }

        // B. Coupon list search
        if (message.contains("coupon") || message.contains("offer") || message.contains("discount") || message.contains("promo")) {
            List<Coupon> coupons = couponRepository.findAll().stream()
                    .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                    .toList();
            if (coupons.isEmpty()) {
                return "We don't have any active discount coupons at the moment. Please check back later!";
            }
            StringBuilder sb = new StringBuilder("**Active Coupons & Offers:**\n\n");
            for (Coupon c : coupons) {
                sb.append("- 🏷️ **").append(c.getCouponCode()).append("**: Get **")
                        .append(c.getDiscount()).append("% off** on your next booking! (Status: Active)\n");
            }
            return sb.toString();
        }

        // C. Sport categories list search
        if (message.contains("which sports") || message.contains("what sports") || message.contains("available sports") || message.contains("list of sports")) {
            List<Category> categories = categoryRepository.findAll();
            if (categories.isEmpty()) {
                return "We offer booking slots for various popular sports like Cricket, Football, Badminton, and Tennis. No specific categories found in database.";
            }
            StringBuilder sb = new StringBuilder("**Available Sports on BookMyPlay:**\n\n");
            for (Category cat : categories) {
                sb.append("- ").append(cat.getCategoryName()).append(" - ").append(cat.getDescription() != null ? cat.getDescription() : "Book venues and play!").append("\n");
            }
            return sb.toString();
        }

        // D. Dynamic database matching (City, Sport, Price Filters)
        List<Venue> venues = venueRepository.findAll();
        if (venues.isEmpty()) {
            return "No sports venues are currently listed in the database. Please list a venue as a vendor to start booking!";
        }

        // 1. Identify category/sport
        Category matchedCategory = null;
        List<Category> categories = categoryRepository.findAll();
        for (Category cat : categories) {
            if (message.contains(cat.getCategoryName().toLowerCase())) {
                matchedCategory = cat;
                break;
            }
        }

        // 2. Identify city
        String matchedCity = null;
        List<String> cities = venues.stream().map(v -> v.getCity().toLowerCase()).distinct().toList();
        for (String city : cities) {
            if (message.contains(city)) {
                matchedCity = city;
                break;
            }
        }

        // 3. Identify price limit ("under 700", "below 500")
        Double maxPrice = null;
        Pattern pricePattern = Pattern.compile("(under|below|less than|max|maximum|budget|price of)\\s*[₹rs]*\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pricePattern.matcher(message);
        if (matcher.find()) {
            try {
                maxPrice = Double.parseDouble(matcher.group(2));
            } catch (NumberFormatException ignored) {}
        }

        // Apply filters
        List<Venue> filteredVenues = new ArrayList<>(venues);

        if (matchedCategory != null) {
            final Category cat = matchedCategory;
            filteredVenues = filteredVenues.stream()
                    .filter(v -> v.getCategory() != null && v.getCategory().getId().equals(cat.getId()))
                    .collect(Collectors.toList());
        }

        if (matchedCity != null) {
            final String city = matchedCity;
            filteredVenues = filteredVenues.stream()
                    .filter(v -> v.getCity().toLowerCase().contains(city))
                    .collect(Collectors.toList());
        }

        if (maxPrice != null) {
            final Double priceLimit = maxPrice;
            filteredVenues = filteredVenues.stream()
                    .filter(v -> v.getPricePerHour() != null && v.getPricePerHour() <= priceLimit)
                    .collect(Collectors.toList());
        }

        // Handle sorting: "cheapest" or "budget"
        if (message.contains("cheap") || message.contains("budget") || message.contains("lowest price") || (message.contains("price") && !message.contains("price desc"))) {
            filteredVenues.sort(Comparator.comparing(v -> v.getPricePerHour() != null ? v.getPricePerHour() : Double.MAX_VALUE));
        }

        // Handle sorting: "top rated" or "best" or "highest"
        boolean requireRatingSort = message.contains("top-rated") || message.contains("top rated") || message.contains("best") || message.contains("popular") || message.contains("rating");
        if (requireRatingSort) {
            List<Review> reviews = reviewRepository.findAll();
            Map<Long, List<Review>> reviewsByVenue = reviews.stream()
                    .filter(r -> r.getVenue() != null)
                    .collect(Collectors.groupingBy(r -> r.getVenue().getId()));
            
            filteredVenues.sort((v1, v2) -> {
                double avg1 = reviewsByVenue.getOrDefault(v1.getId(), Collections.emptyList()).stream()
                        .mapToInt(Review::getRating).average().orElse(0.0);
                double avg2 = reviewsByVenue.getOrDefault(v2.getId(), Collections.emptyList()).stream()
                        .mapToInt(Review::getRating).average().orElse(0.0);
                return Double.compare(avg2, avg1); // Descending
            });
        }

        // Format result list
        if (!filteredVenues.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            sb.append("Here are some matching venues we found on BookMyPlay:\n\n");
            
            // Limit to top 5
            int limit = Math.min(filteredVenues.size(), 5);
            for (int i = 0; i < limit; i++) {
                Venue v = filteredVenues.get(i);
                sb.append(i + 1).append(". 🏟️ **").append(v.getVenueName()).append("**\n")
                        .append("   - **Sport:** ").append(v.getCategory().getCategoryName()).append("\n")
                        .append("   - **Location:** ").append(v.getCity()).append(" (").append(v.getAddress()).append(")\n")
                        .append("   - **Price:** ₹").append(v.getPricePerHour()).append("/hour\n")
                        .append("   - **Link:** [View Details & Book](/venue/").append(v.getId()).append(")\n\n");
            }
            return sb.toString();
        }

        // Ultimate fallback
        return "I'm sorry, I couldn't find any specific venues matching your query. Would you like to check our available sports categories, coupons, or view help with bookings?";
    }
}
