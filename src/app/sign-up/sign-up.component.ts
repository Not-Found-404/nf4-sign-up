import {Component, OnInit} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {UserService} from '../services/user.service';
import {Result} from '../services/result';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'sign-up-layout',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  validateForm: FormGroup;
  okPhoneNumber: Boolean = true;

  createMessage(type: string): void {
    if (type === 'success') {
      this.message.create(type, `此手机号可以用`);
    } else {
      this.message.create(type, `此手机号已注册，请重新输入`);
    }
  }

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.validateForm.controls.checkPassword.updateValueAndValidity());
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return {required: true};
    } else if (control.value !== this.validateForm.controls.password.value) {
      return {confirm: true, error: true};
    }
  }

  // 验证手机号是否用过
  exitPhoneNum(phoneNumber: String): void {
    this.userService.exitPhoneNum(phoneNumber).subscribe((data: Result) => {
      if (data.code === 500) { // 手机号已存在
        this.createMessage('error');
        this.okPhoneNumber = false;
      } else if (data.code === 200) { // 手机号可用
        // this.createMessage('success');
        this.okPhoneNumber = true;
      }
    });
  }

  // 得到验证码
  getCaptcha(phoneNumber: String): void {
    this.userService.sendVerifyCode(phoneNumber).subscribe();
  }

  // 跳转到登录
  toSignIn(phoneNumber: String, password: String, username: String, verifyCode: String): void {
    this.userService.register({
      phoneNum: phoneNumber,
      password: password,
      username: username,
      verifyCode: verifyCode
    }).subscribe((data: Result) => {
      if (data.code === 500) {
        this.message.create('error', `验证码错误`);
      } else {
        // this.message.create('success', `注册成功`);
        alert('注册成功');
        window.open('toHomePage', '_self');
      }
    });

  }

  private getSleep(sleepTime: number = 0): void {
    for (let t = Date.now(); Date.now() - t <= sleepTime;) ;
  }

  constructor(private fb: FormBuilder, private userService: UserService, private message: NzMessageService) {
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      password: [null, [Validators.required]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]],
      nickname: [null, [Validators.required]],
      phoneNumberPrefix: ['+86'],
      phoneNumber: [null, [Validators.required]],
      captcha: [null, [Validators.required]],
      // agree: [false , [Validators.required]],
    });
  }
}
