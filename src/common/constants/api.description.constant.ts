export const PRODUCT = {
  CREATE: {
    summary: 'Create Product',
    description: `
        Creates a new product in the system.
        
        **Access**: Only users with the ADMIN or MANAGER role can access this endpoint.
        
        **Request Body**:
        - Must contain all required fields defined in the CreateProductDto.
        
        **Tenant ID**:
        - The tenant ID is derived from the authenticated user.
      `,
  },
  UPDATE: {
    summary: 'Update Product',
    description: `
        Updates an existing product in the system.
        
        **Access**: Only users with the ADMIN or MANAGER role can access this endpoint.
        
        **Parameters**:
        - The ID of the product to be updated is provided in the URL path.
        
        **Request Body**:
        - Must contain the updated fields defined in the UpdateProductDto.
        
        **Response**:
        - Returns the updated product information.
      `,
  },
  FIND_BY_ID: {
    summary: 'Get Product By Id',
    description: `
        Retrieves detailed information about a product by its ID.
        
        **Access**: Users with the ADMIN, MANAGER, or STAFF role can access this endpoint.
        
        **Parameters**:
        - The ID of the product to be fetched is provided in the URL path.
        
        **Response**:
        - Returns the product details.
      `,
  },
  LIST: {
    summary: 'Get Product List',
    description: `
        Retrieves a list of all products.
        
        **Access**: Users with the ADMIN, MANAGER, or STAFF role can access this endpoint.
        
        **Response**:
        - Returns a list of products.
      `,
  },
  DELETE: {
    summary: 'Delete Product',
    description: `
        Deletes a product from the system by its ID.
        
        **Access**: Only users with the ADMIN role can access this endpoint.
        
        **Parameters**:
        - The ID of the product to be deleted is provided in the URL path.
        
        **Response**:
        - Returns a confirmation of the deletion.
      `,
  },
  LIST_BY_TENANT: {
    summary: 'Get Product By Tenant Id',
    description: `
        Retrieves a list of products associated with a specific tenant.
        
        **Access**: Only users with the ADMIN or MANAGER role can access this endpoint.
        
        **Parameters**:
        - The tenant ID is provided in the URL path.
        
        **Response**:
        - Returns a list of products associated with the specified tenant.
      `,
  },
};
export const USER = {
  LOGIN: {
    summary: 'User Login',
    description: `
        Authenticates a user and returns an access token.
        
        **Access**: Only users with the SUPER ADMIN, ADMIN or MANAGER role can access this endpoint.
        
        **Request Body**:
        - The request body must contain the email and password fields.
        
        **Response**:
        - Returns the access token.
      `,
  },
  CHANGE_PASSWORD: {
    summary: 'User Change Password',
    description: `
        Changes the password of a user.
        
        **Access**: Only users with the ADMIN or MANAGER role can access this endpoint.
        
        **Request Body**:
        - The request body must contain the id, oldPassword and newPassword fields.
        
        **Response**:
        - Returns a confirmation of the password change.
      `,
  },
  CREATE: {
    summary: 'Create User',
    description: `
        Creates a new user in the system.
        
        **Access**: Only users with the ADMIN role can access this endpoint.
        
        **Request Body**:
        - The request body must contain all required fields defined in the CreateUserDto.
        
        **Response**:
        - Returns the created user information, including ID, name, email, phone, and address.
      `,
  },
  UPDATE: {
    summary: 'Update User',
    description: `
        Updates the information of an existing user.
        
        **Access**: Only users with the ADMIN role can access this endpoint.
        
        **Parameters**:
        - The ID of the user to be updated is provided in the URL path.
        
        **Request Body**:
        - The request body must contain the updated fields defined in the UpdateUserDto.
        
        **Response**:
        - Returns the updated user information, including ID, name, email, phone, and address.
      `,
  },
  FIND_BY_ID: {
    summary: 'Find User By Id',
    description: `
        Retrieves detailed information about a user by their ID.
        
        **Access**: Only users with the ADMIN or MANAGER role can access this endpoint.
        
        **Parameters**:
        - The ID of the user to be fetched is provided in the URL path.
        
        **Response**:
        - Returns the user details.
      `,
  },
  FIND_ALL: {
    summary: 'Find All Users',
    description: `
        Retrieves a list of all users in the system.
        
        **Access**: Only users with the ADMIN or MANAGER role can access this endpoint.
        
        **Response**:
        - Returns a list of all users.
      `,
  },
  DELETE: {
    summary: 'Delete User By Id',
    description: `
        Deletes a user from the system by their ID.
        
        **Access**: Only users with the ADMIN role can access this endpoint.
        
        **Parameters**:
        - The ID of the user to be deleted is provided in the URL path.
        
        **Response**:
        - Returns a confirmation of the deletion.
      `,
  },
  LIST_BY_TENANT: {
    summary: 'Get User By Tenant Id',
    description: `
        Retrieves a list of users associated with a specific tenant.
        
        **Access**: Only users with the ADMIN or MANAGER role can access this endpoint.
        
        **Parameters**:
        - The tenant ID is provided in the URL path.
        
        **Response**:
        - Returns a list of users associated with the specified tenant.
      `,
  },
};

export const TENANT = {
  CREATE: {
    summary: 'Create Tenant',
    description: `
        Creates a new tenant in the system.
        
        **Access**: Only users with the SUPER ADMIN role can access this endpoint.
        
        **Request Body**:
        - The request body must contain all required fields defined in the CreateTenantDto.
        
        **Response**:
        - Returns the created tenant information, including ID, name.
      `,
  },
  UPDATE: {
    summary: 'Update Tenant',
    description: `
        Updates the information of an existing tenant.
        
        **Access**: Only users with the SUPER ADMIN role can access this endpoint.
        
        **Parameters**:
        - The ID of the tenant to be updated is provided in the URL path.
        
        **Request Body**:
        - The request body must contain the updated fields defined in the UpdateTenantDto.
        
        **Response**:
        - Returns the updated tenant information, including ID, name.
      `,
  },
  FIND_BY_ID: {
    summary: 'Find Tenant By Id',
    description: `
        Retrieves detailed information about a tenant by their ID.
        
        **Access**: Only users with the SUPER ADMIN role can access this endpoint.
        
        **Parameters**:
        - The ID of the tenant to be fetched is provided in the URL path.
        
        **Response**:
        - Returns the tenant details.
      `,
  },
  FIND_ALL: {
    summary: 'Find All Tenants',
    description: `
        Retrieves a list of all tenants in the system.
        
        **Access**: Only users with the SUPER ADMIN role can access this endpoint.
        
        **Response**:
        - Returns a list of all tenants.
      `,
  },
  DELETE: {
    summary: 'Delete Tenant By Id',
    description: `
        Deletes a tenant from the system by their ID.
        
        **Access**: Only users with the SUPER ADMIN role can access this endpoint.
        
        **Parameters**:
        - The ID of the tenant to be deleted is provided in the URL path.
        
        **Response**:
        - Returns a confirmation of the deletion.
      `,
  },
};
