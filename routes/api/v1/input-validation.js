const Validator = require('validator');

const isEmpty = (value) =>
   value === undefined ||
   value === null ||
   (typeof value === 'object' && Object.keys(value).length === 0) ||
   (typeof value === 'string' && value.trim().length === 0);

class inputValidation {

   static createUser({ login, fullname, password, password2 }) {
      let errors = {};
      let values = { login, fullname, password, password2 };

      login = !isEmpty(login) ? login : '';
      fullname = !isEmpty(fullname) ? fullname : '';
      password = !isEmpty(password) ? password : '';
      password2 = !isEmpty(password2) ? password2 : '';


      if (!Validator.isLength(login, { min: 3, max: 30 })) {
         errors.login = 'Login must be between 3 and 30 characters';
      }

      if (Validator.isEmpty(login)) {
         errors.login = 'Login field is required';
      }

      if (!Validator.isLength(fullname, { min: 2, max: 30 })) {
         errors.fullname = 'Full name must be between 3 and 30 characters';
      }

      if (Validator.isEmpty(fullname)) {
         errors.fullname = 'Full name field is required';
      }

      if (Validator.isEmpty(password)) {
         errors.password = 'Password field is required';
      }

      if (!Validator.isLength(password, { min: 6, max: 30 })) {
         errors.password = 'Password must be at least 6 characters';
      }

      if (Validator.isEmpty(password2)) {
         errors.password2 = 'Confirm Password field is required';
      }

      if (!Validator.equals(password, password2)) {
         errors.password2 = 'Passwords must match';
      }

      return {
         values,
         errors,
         isValid: isEmpty(errors)
      }
   };

   static updateUser({ login, fullname, password, password2 }) {
      let errors = {};

      login = !isEmpty(login) ? login : '';
      fullname = !isEmpty(fullname) ? fullname : '';
      password = !isEmpty(password) ? password : '';
      password2 = !isEmpty(password2) ? password2 : '';

      if (!Validator.isEmpty(login) && !Validator.isLength(login, { min: 2, max: 30 })) {
         errors.login = 'Login must be between 3 and 30 characters';
      }

      if (!Validator.isEmpty(fullname) && !Validator.isLength(fullname, { min: 2, max: 30 })) {
         errors.fullname = 'Full name must be between 3 and 30 characters';
      }

      if (!Validator.isEmpty(password)) {
         if (!Validator.isLength(password, { min: 6, max: 30 })) {
            errors.password = 'Password must be at least 6 characters';
         }
         if (!Validator.equals(password, password2)) {
            errors.password2 = 'Passwords must match';
         }
         if (Validator.isEmpty(password2)) {
            errors.password2 = 'Confirm Password field is required';
         }
      }


      return {
         errors,
         isValid: isEmpty(errors)
      }
   };


}


module.exports = inputValidation;