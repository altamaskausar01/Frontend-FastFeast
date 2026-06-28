import { ApiResponse } from '../../utils/ApiResponse';

describe('ApiResponse', () => {
  describe('constructor', () => {
    it('should create a success response with data', () => {
      const response = new ApiResponse({ id: 1, name: 'Test' });
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: 1, name: 'Test' });
      expect(response.message).toBeUndefined();
      expect(response.meta).toBeUndefined();
    });

    it('should create a response with message and meta', () => {
      const response = new ApiResponse('data', {
        message: 'Created successfully',
        meta: { version: '1.0' },
      });
      expect(response.success).toBe(true);
      expect(response.data).toBe('data');
      expect(response.message).toBe('Created successfully');
      expect(response.meta).toEqual({ version: '1.0' });
    });
  });

  describe('static success', () => {
    it('should create a success response without message', () => {
      const response = ApiResponse.success([1, 2, 3]);
      expect(response.success).toBe(true);
      expect(response.data).toEqual([1, 2, 3]);
      expect(response.message).toBeUndefined();
    });

    it('should create a success response with a message', () => {
      const response = ApiResponse.success({ saved: true }, 'Saved!');
      expect(response.data).toEqual({ saved: true });
      expect(response.message).toBe('Saved!');
    });
  });

  describe('static paginated', () => {
    const items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    it('should create a paginated response', () => {
      const response = ApiResponse.paginated(items, 1, 10, 25);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(items);
      expect(response.meta).toBeDefined();
    });

    it('should calculate totalPages correctly', () => {
      const response = ApiResponse.paginated(items, 1, 10, 25);
      expect(response.meta!.totalPages).toBe(3);
    });

    it('should set hasMore to true when there are more items', () => {
      const response = ApiResponse.paginated(items, 1, 10, 25);
      expect(response.meta!.hasMore).toBe(true);
    });

    it('should set hasMore to false on the last page', () => {
      const response = ApiResponse.paginated(items, 3, 10, 25);
      expect(response.meta!.hasMore).toBe(false);
    });

    it('should handle edge case of zero total', () => {
      const response = ApiResponse.paginated([], 1, 10, 0);
      expect(response.meta!.totalPages).toBe(0);
      expect(response.meta!.hasMore).toBe(false);
    });

    it('should include page and limit in meta', () => {
      const response = ApiResponse.paginated(items, 2, 20, 50);
      expect(response.meta!.page).toBe(2);
      expect(response.meta!.limit).toBe(20);
      expect(response.meta!.total).toBe(50);
    });

    it('should accept an optional message', () => {
      const response = ApiResponse.paginated(items, 1, 10, 25, 'Items fetched');
      expect(response.message).toBe('Items fetched');
    });
  });
});
