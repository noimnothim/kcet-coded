export interface College {
  code: string;
  name: string;
}

export interface CollegeReview {
  id: string;
  college_id: string;
  user_id?: string; // Made optional for anonymous reviews
  session_id?: string; // Added for anonymous user tracking
  rating: number;
  review_text: string;
  faculty_rating: number;
  infrastructure_rating: number;
  placements_rating: number;
  helpful_votes: number;
  verified: boolean;
  created_at: string;
  // Additional fields for display
  collegeCode?: string;
  collegeName?: string;
  author?: string;
  // Additional fields to match working schema
  comment?: string;
  course?: string;
  graduation_year?: number;
  helpful?: number;
}

import { supabase } from "@/integrations/supabase/client";

// Get or create a user session ID for tracking user's own reviews
const getUserSessionId = (): string => {
  let sessionId = localStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('user_session_id', sessionId);
    console.log('🆕 Created new user session ID:', sessionId);
  } else {
    console.log('🔄 Using existing user session ID:', sessionId);
  }
  return sessionId;
};

// Load reviews from localStorage (temporary solution)
const loadReviewsFromLocalStorage = (): CollegeReview[] => {
  try {
    const reviews = JSON.parse(localStorage.getItem('local_reviews') || '[]');
    console.log(`Loaded ${reviews.length} reviews from localStorage`);
    console.log('Reviews data:', reviews);
    return reviews;
  } catch (error) {
    console.error('Error loading reviews from localStorage:', error);
    return [];
  }
};

// Load reviews from Supabase (when authentication is properly set up)
const loadReviewsFromSupabase = async (): Promise<CollegeReview[]> => {
  try {
    console.log('Loading reviews from Supabase...');
    
    // First try simple query without joins
    const { data: reviews, error: reviewsError } = await supabase
      .from('college_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error loading reviews from Supabase:', reviewsError);
      return [];
    }

    console.log(`Loaded ${reviews?.length || 0} reviews from Supabase`);
    
    if (!reviews || reviews.length === 0) {
      return [];
    }

    // Get college information for each review
    const collegeIds = [...new Set(reviews.map(review => review.college_id))];
    const { data: colleges, error: collegesError } = await supabase
      .from('colleges')
      .select('id, code, name')
      .in('id', collegeIds);

    if (collegesError) {
      console.error('Error loading colleges:', collegesError);
      // Still return reviews even if college data fails to load
      return reviews.map(review => ({
        id: review.id,
        college_id: review.college_id,
        user_id: review.user_id,
        session_id: review.session_id,
        rating: review.rating || 0,
        review_text: review.review_text || '',
        faculty_rating: review.faculty_rating || 0,
        infrastructure_rating: review.infrastructure_rating || 0,
        placements_rating: review.placements_rating || 0,
        helpful_votes: review.helpful_votes || 0,
        verified: review.verified || false,
        created_at: review.created_at || new Date().toISOString(),
        collegeCode: 'Unknown',
        collegeName: 'Unknown College',
        author: 'Anonymous User',
        // Additional fields (using defaults since they don't exist in current schema)
        comment: review.review_text,
        course: '',
        graduation_year: new Date().getFullYear(),
        helpful: review.helpful_votes || 0
      }));
    }

    // Create a lookup map for colleges
    const collegeMap = new Map();
    if (colleges) {
      colleges.forEach(college => {
        collegeMap.set(college.id, college);
      });
    }

    return reviews.map(review => {
      const college = collegeMap.get(review.college_id);
      const currentSessionId = getUserSessionId();
      const reviewSessionId = review.session_id;
      const reviewUserId = review.user_id;
      
      // Check if this is the current user's review
      // For old reviews: check if user_id matches session_id (backward compatibility)
      // For new reviews: check if session_id matches current session
      const isCurrentUser = reviewUserId === currentSessionId || reviewSessionId === currentSessionId;
      
      return {
        id: review.id,
        college_id: review.college_id,
        user_id: review.user_id,
        session_id: reviewSessionId,
        rating: review.rating || 0,
        review_text: review.review_text || '',
        faculty_rating: review.faculty_rating || 0,
        infrastructure_rating: review.infrastructure_rating || 0,
        placements_rating: review.placements_rating || 0,
        helpful_votes: review.helpful_votes || 0,
        verified: review.verified || false,
        created_at: review.created_at || new Date().toISOString(),
        collegeCode: college?.code,
        collegeName: college?.name,
        author: isCurrentUser ? 'You' : `Anonymous User`, // Show "You" for current user's reviews, "Anonymous User" for others
        // Additional fields (using defaults since they don't exist in current schema)
        comment: review.review_text,
        course: '',
        graduation_year: new Date().getFullYear(),
        helpful: review.helpful_votes || 0
      };
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
};

export const loadColleges = async (): Promise<College[]> => {
  try {
    const response = await fetch('/colleges-list.json');
    if (!response.ok) {
      throw new Error('Failed to load colleges data');
    }
    const colleges = await response.json();
    
    // Clean up college names
    return colleges.map((college: College) => ({
      ...college,
      name: college.name
        .replace(/^E:\s*/, '')   // Remove leading "E:" prefix
        .replace(/\s*:\s*$/, '') // Remove trailing ":" and spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .trim()
    }));
  } catch (error) {
    console.error('Error loading colleges:', error);
    return [];
  }
};

export const loadCollegeReviews = async (): Promise<CollegeReview[]> => {
  try {
    // Always try Supabase first
    console.log('Loading reviews from Supabase...');
    const supabaseReviews = await loadReviewsFromSupabase();
    console.log(`Loaded ${supabaseReviews.length} reviews from Supabase`);
    return supabaseReviews;
  } catch (error) {
    console.error('Error loading college reviews from Supabase:', error);
    // Only fallback to localStorage if Supabase completely fails
    console.log('Falling back to localStorage...');
    return loadReviewsFromLocalStorage();
  }
};

export const getCollegesWithReviews = async (): Promise<{ college: College; reviews: CollegeReview[] }[]> => {
  try {
    const colleges = await loadColleges();
    const allReviews = await loadCollegeReviews();
    
    console.log(`Found ${colleges.length} colleges and ${allReviews.length} reviews`);
    
    const result = colleges.map(college => ({
      college,
      reviews: allReviews.filter(review => review.collegeCode === college.code)
    }));
    
    console.log(`Mapped ${result.length} colleges with reviews`);
    return result;
  } catch (error) {
    console.error('Error loading colleges with reviews:', error);
    return [];
  }
};

export const saveReviewToSupabase = async (reviewData: {
  collegeCode: string;
  rating: number;
  review_text: string;
  faculty_rating: number;
  infrastructure_rating: number;
  placements_rating: number;
  user_id?: string;
  comment?: string;
  course?: string;
  graduation_year?: number;
}): Promise<CollegeReview | null> => {
  try {
    console.log('Saving review to Supabase:', reviewData.collegeCode);
    
    // First, check if the college exists in the database
    let { data: collegeData, error: collegeError } = await supabase
      .from('colleges')
      .select('id')
      .eq('code', reviewData.collegeCode)
      .single();

    if (collegeError || !collegeData) {
      console.log('College not found, creating new college:', reviewData.collegeCode);
      
      // Get the real college name from the colleges list
      let collegeName = `College ${reviewData.collegeCode}`;
      try {
        const response = await fetch('/colleges-list.json');
        if (response.ok) {
          const colleges = await response.json();
          const realCollege = colleges.find((col: any) => col.code === reviewData.collegeCode);
          if (realCollege) {
            collegeName = realCollege.name
              .replace(/^E:\s*/, '')   // Remove leading "E:" prefix
              .replace(/\s*:\s*$/, '') // Remove trailing ":" and spaces
              .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
              .trim();
          }
        }
      } catch (error) {
        console.log('Could not fetch college name, using default');
      }
      
      // Create the college if it doesn't exist
      const { data: newCollege, error: createCollegeError } = await supabase
        .from('colleges')
        .insert({
          code: reviewData.collegeCode,
          name: collegeName
        })
        .select()
        .single();

      if (createCollegeError || !newCollege) {
        console.error('Error creating college:', createCollegeError);
        // If it's a duplicate key error, try to fetch the existing college
        if (createCollegeError?.code === '23505') {
          console.log('College already exists, fetching it...');
          const { data: existingCollege, error: fetchError } = await supabase
            .from('colleges')
            .select('id')
            .eq('code', reviewData.collegeCode)
            .single();
          
          if (fetchError || !existingCollege) {
            console.error('Error fetching existing college:', fetchError);
            return saveToLocalStorage(reviewData);
          }
          collegeData = existingCollege;
        } else {
          // Fallback to localStorage
          return saveToLocalStorage(reviewData);
        }
      } else {
        collegeData = newCollege;
      }
    }

    // Use the user session ID for tracking user's own reviews
    const userSessionId = getUserSessionId();
    
    console.log('Using user session ID:', userSessionId);

    console.log('Inserting review...');
    const { data, error } = await supabase
      .from('college_reviews')
      .insert({
        college_id: collegeData.id,
        session_id: userSessionId, // Use session_id for anonymous users
        rating: reviewData.rating,
        review_text: reviewData.review_text,
        faculty_rating: reviewData.faculty_rating,
        infrastructure_rating: reviewData.infrastructure_rating,
        placements_rating: reviewData.placements_rating,
        helpful_votes: 0,
        verified: false,
        // Note: Additional fields like comment, course, graduation_year are not available in current schema
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving review to Supabase:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      // Fallback to localStorage
      return saveToLocalStorage(reviewData);
    }

    console.log('Review saved successfully to Supabase:', data.id);
    return {
      id: data.id,
      college_id: data.college_id,
      user_id: data.user_id,
      session_id: data.session_id,
      rating: data.rating || 0,
      review_text: data.review_text || '',
      faculty_rating: data.faculty_rating || 0,
      infrastructure_rating: data.infrastructure_rating || 0,
      placements_rating: data.placements_rating || 0,
      helpful_votes: data.helpful_votes || 0,
      verified: data.verified || false,
      created_at: data.created_at || new Date().toISOString(),
      collegeCode: reviewData.collegeCode,
      author: `You`, // Since this is the current user's review
      // Additional fields (using defaults since they don't exist in current schema)
      comment: data.review_text,
      course: '',
      graduation_year: new Date().getFullYear(),
      helpful: data.helpful_votes || 0
    };
  } catch (error) {
    console.error('Error saving review:', error);
    // Fallback to localStorage
    return saveToLocalStorage(reviewData);
  }
};

// Helper function to save to localStorage as fallback
const saveToLocalStorage = (reviewData: {
  collegeCode: string;
  rating: number;
  review_text: string;
  faculty_rating: number;
  infrastructure_rating: number;
  placements_rating: number;
  user_id?: string;
  comment?: string;
  course?: string;
  graduation_year?: number;
}): CollegeReview => {
  console.log('Saving to localStorage as fallback');
  
  const mockReview: CollegeReview = {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    college_id: `college_${reviewData.collegeCode}`,
    session_id: getUserSessionId(),
    rating: reviewData.rating,
    review_text: reviewData.review_text,
    faculty_rating: reviewData.faculty_rating,
    infrastructure_rating: reviewData.infrastructure_rating,
    placements_rating: reviewData.placements_rating,
    helpful_votes: 0,
    verified: false,
    created_at: new Date().toISOString(),
    collegeCode: reviewData.collegeCode,
    author: `You`,
    // Additional fields
    comment: reviewData.comment || reviewData.review_text,
    course: reviewData.course,
    graduation_year: reviewData.graduation_year,
    helpful: 0
  };

  // Store in localStorage for persistence during session
  const existingReviews = JSON.parse(localStorage.getItem('local_reviews') || '[]');
  console.log(`Before saving: ${existingReviews.length} reviews in localStorage`);
  
  existingReviews.push(mockReview);
  localStorage.setItem('local_reviews', JSON.stringify(existingReviews));
  
  // Verify it was saved
  const savedReviews = JSON.parse(localStorage.getItem('local_reviews') || '[]');
  console.log(`After saving: ${savedReviews.length} reviews in localStorage`);
  console.log('Review saved to localStorage:', mockReview.id);
  console.log('Saved review data:', mockReview);
  
  return mockReview;
};

// Delete review from Supabase
export const deleteReviewFromSupabase = async (reviewId: string): Promise<boolean> => {
  try {
    console.log('Deleting review from Supabase:', reviewId);
    
    const { error } = await supabase
      .from('college_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review from Supabase:', error);
      return false;
    }

    console.log('Review deleted successfully from Supabase');
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
};

// Delete review from localStorage
const deleteFromLocalStorage = (reviewId: string): boolean => {
  try {
    console.log('Deleting review from localStorage:', reviewId);
    
    const existingReviews = JSON.parse(localStorage.getItem('local_reviews') || '[]');
    const updatedReviews = existingReviews.filter((review: CollegeReview) => review.id !== reviewId);
    
    localStorage.setItem('local_reviews', JSON.stringify(updatedReviews));
    
    console.log(`Review deleted from localStorage. ${existingReviews.length - updatedReviews.length} review(s) removed.`);
    return true;
  } catch (error) {
    console.error('Error deleting review from localStorage:', error);
    return false;
  }
};

// Check if a review belongs to the current user
export const isUserReview = (review: CollegeReview): boolean => {
  const userSessionId = getUserSessionId();
  const reviewUserId = review.user_id;
  const reviewSessionId = review.session_id;
  
  // For backward compatibility: old reviews use user_id as session_id
  // For new reviews: use session_id field
  const isCurrentUser = reviewUserId === userSessionId || reviewSessionId === userSessionId;
  
  console.log('🔍 Checking if review belongs to user:');
  console.log('  Review user_id:', reviewUserId);
  console.log('  Review session_id:', reviewSessionId);
  console.log('  Current session ID:', userSessionId);
  console.log('  Is user review:', isCurrentUser);
  return isCurrentUser;
};

// Main delete function that tries Supabase first, then localStorage
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    // Try Supabase first
    const supabaseSuccess = await deleteReviewFromSupabase(reviewId);
    if (supabaseSuccess) {
      return true;
    }
    
    // Fallback to localStorage
    console.log('Supabase delete failed, trying localStorage...');
    return deleteFromLocalStorage(reviewId);
  } catch (error) {
    console.error('Error deleting review:', error);
    // Fallback to localStorage
    return deleteFromLocalStorage(reviewId);
  }
};
