import api from './api'

export const ratingsApi = {
  // Submit or update a rating
  submitRating(data: {
    userId: string
    score: number
    comment?: string
    tags?: string[]
  }) {
    return api.post('/ratings', data)
  },

  // Get rating stats for a user
  getUserRatingStats(userId: string) {
    return api.get(`/ratings/user/${userId}`)
  },

  // Get all ratings for a user (with pagination support)
  getAllRatingsForUser(userId: string) {
    return api.get(`/ratings/user/${userId}/all`)
  },

  // Delete a rating
  deleteRating(ratingId: string) {
    return api.delete(`/ratings/${ratingId}`)
  },
}
