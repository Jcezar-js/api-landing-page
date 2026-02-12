import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  }
})

userSchema.pre('save', async function(this: any){
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model('User', userSchema)