'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');

const requestMeUrl = 'https://kapi.kakao.com/v2/user/me?secure_resource=true';

function requestMe(kakaoAccessToken) {
  console.log('Requesting user profile from Kakao API server.');
  return request({
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + kakaoAccessToken },
    url: requestMeUrl,
  });
}

function updateOrCreateUser(userId, email, displayName, photoURL) {
  console.log('Updating or creating a user');
  const user = {
    userId: userId,
    displayName: displayName,
  };
  if (displayName) {
    user['displayName'] = displayName;
  }
  if (email) {
    user['email'] = email;
  } else {
    user['email'] = userId.slice(6) + '@sovement.com';
  }
  if (photoURL) {
    user['photoURL'] = photoURL;
  }
  console.log(user);
  // Perform the logic to update or create a user in your Node.js application
  // ...
  // Return the updated or created user object
  return user;
}

function createCustomToken(userId) {
  console.log(`Creating a custom token based on UID ${userId}`);
  // Perform the logic to create a custom token in your Node.js application
  // ...
  // Return the generated custom token
  const customToken = 'SAMPLE_CUSTOM_TOKEN';
  return customToken;
}

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send('KakaoLoginServer is up and running!');
});

app.post('/verifyToken', (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).send({ error: 'There is no token.', message: 'Access token is a required parameter.' });
  }

  console.log(`Verifying Kakao token: ${token}`);

  requestMe(token).then((response) => {
    const body = JSON.parse(response);
    console.log(body);
    const userId = `kakao:${body.id}`;
    if (!userId) {
      return response.status(404).send({ message: 'There was no user with the given access token.' });
    }
    let nickname = body.kakao_account.profile.nickname;
    let profileImage = body.kakao_account.profile.thumbnail_image_url;
    let email = '';
    if (body.properties) {
      nickname = body.properties.nickname;
      profileImage = body.properties.profile_image;
    }
    if (body.kakao_account.is_email_valid) {
      email = body.kakao_account.email;
    }
    const user = updateOrCreateUser(userId, email, nickname, profileImage);
    const customToken = createCustomToken(userId);

    console.log(`Returning custom token to user: ${customToken}`);
    res.send({ custom_token: customToken });
  });
});

app.listen(port, () => {
  console.log(`KakaoLoginServer listening on port ${port}`);
});
